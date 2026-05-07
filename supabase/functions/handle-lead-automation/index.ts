import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LeadRecord {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  source: string | null;
  notes: string | null;
  status: string;
}

interface CampaignRecord {
  id: string;
  name: string;
  context: string;
  prompt_template: string | null;
}

function buildPrompt(lead: LeadRecord, campaign: CampaignRecord, customFields: Record<string, string> = {}): string {
  const customFieldsText = Object.keys(customFields).length > 0
    ? Object.entries(customFields)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")
    : null;

  const leadContext = [
    `- Nome: ${lead.name}`,
    lead.company   ? `- Empresa: ${lead.company}`   : null,
    lead.job_title ? `- Cargo: ${lead.job_title}`    : null,
    lead.source    ? `- Origem: ${lead.source}`      : null,
    lead.notes     ? `- Observações: ${lead.notes}`  : null,
    customFieldsText ? `\nCampos personalizados:\n${customFieldsText}` : null,
  ].filter(Boolean).join("\n");

  const personaSection = campaign.prompt_template
    ? `\nPersona e Tom de Voz:\n${campaign.prompt_template}`
    : "\nUse um tom profissional, consultivo e empático. Seja direto e personalizado.";

  return `Você é um especialista em vendas B2B. Gere 3 variações distintas de mensagem de prospecção para o lead abaixo.

Campanha: ${campaign.name}
Contexto do Produto/Oferta:
${campaign.context}
${personaSection}

Dados do Lead:
${leadContext}

Instruções:
1. Gere exatamente 3 variações com abordagens diferentes (ex: direta, consultiva, provocativa)
2. Cada mensagem deve ser personalizada com os dados reais do lead
3. Mensagens curtas (máximo 5 linhas), sem jargões excessivos
4. Não inclua assunto de e-mail — apenas o corpo da mensagem
5. Retorne APENAS o JSON puro a seguir, sem markdown, sem blocos de código, sem texto antes ou depois. Todas as aspas dentro dos valores de "text" DEVEM ser escapadas com \\\":
{"variations":[{"label":"Direta","text":"..."},{"label":"Consultiva","text":"..."},{"label":"Provocativa","text":"..."}]}`;
}

function parseGeminiJson(raw: string): unknown {
  let text = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  try {
    return JSON.parse(text);
  } catch {
    // Strip invisible control characters (U+0000–U+001F except tab/LF/CR) and retry
    const sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    return JSON.parse(sanitized);
  }
}

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const { type, record, old_record } = payload as {
      type: string;
      record: LeadRecord;
      old_record: LeadRecord | null;
    };

    console.log(`[handle-lead-automation] Event: ${type}, lead: ${record?.id}, status: ${record?.status}`);

    // Skip if status did not change (defensive guard — trigger already filters this)
    if (type === "UPDATE" && old_record?.status === record?.status) {
      console.log("[handle-lead-automation] Status unchanged, skipping.");
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const newStatus    = record.status;
    const workspaceId  = record.workspace_id;
    const leadId       = record.id;

    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey       = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("[handle-lead-automation] GEMINI_API_KEY not configured.");
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Find active campaigns triggered by this stage
    const { data: campaigns, error: campaignsErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("trigger_stage", newStatus)
      .eq("is_active", true);

    if (campaignsErr) {
      console.error("[handle-lead-automation] Error fetching campaigns:", campaignsErr);
      return new Response(JSON.stringify({ error: campaignsErr.message }), { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      console.log(`[handle-lead-automation] No active campaigns for stage "${newStatus}".`);
      return new Response(JSON.stringify({ message: "No matching campaigns" }), { status: 200 });
    }

    console.log(`[handle-lead-automation] Processing ${campaigns.length} campaign(s) for stage "${newStatus}".`);

    // Fetch custom field values for this lead (with field names)
    const { data: fieldDefs } = await supabase
      .from("field_definitions")
      .select("id, name")
      .eq("workspace_id", workspaceId);

    const { data: cfValues } = await supabase
      .from("lead_custom_fields")
      .select("field_definition_id, value")
      .eq("lead_id", leadId);

    const customFields: Record<string, string> = {};
    for (const cf of cfValues ?? []) {
      const def = fieldDefs?.find((d) => d.id === cf.field_definition_id);
      if (def && cf.value) customFields[def.name] = cf.value;
    }

    for (const campaign of campaigns as CampaignRecord[]) {
      // Anti-loop guard: skip if messages were already generated for this pair in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from("messages")
        .select("id")
        .eq("lead_id", leadId)
        .eq("campaign_id", campaign.id)
        .gte("created_at", fiveMinutesAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        console.log(`[handle-lead-automation] Messages already generated recently for campaign "${campaign.name}", skipping.`);
        continue;
      }

      const prompt = buildPrompt(record, campaign, customFields);

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: 2048, responseMimeType: "application/json" },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errBody = await geminiRes.text();
          console.error(`[handle-lead-automation] Gemini error for campaign "${campaign.name}":`, errBody);
          continue;
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        console.log(`[handle-lead-automation] rawText (${rawText.length} chars):`, rawText.slice(0, 300));
        const parsed   = parseGeminiJson(rawText) as { variations: { label: string; text: string }[] };

        const rows = parsed.variations.map((v) => ({
          lead_id:     leadId,
          campaign_id: campaign.id,
          content:     v.text,
          label:       v.label,
          status:      "draft",
        }));

        const { error: insertErr } = await supabase.from("messages").insert(rows);

        if (insertErr) {
          console.error(`[handle-lead-automation] Insert error for campaign "${campaign.name}":`, insertErr);
        } else {
          console.log(`[handle-lead-automation] Saved ${rows.length} messages for campaign "${campaign.name}".`);
        }
      } catch (err) {
        console.error(`[handle-lead-automation] Unexpected error for campaign "${campaign.name}":`, err);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[handle-lead-automation] Fatal error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
