import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LeadData {
  name: string;
  company?: string | null;
  job_title?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  notes?: string | null;
  custom_fields?: Record<string, string>;
}

interface CampaignData {
  name: string;
  context: string;
  prompt_template?: string | null;
}

interface RequestBody {
  lead: LeadData;
  campaign: CampaignData;
}

function buildPrompt(lead: LeadData, campaign: CampaignData): string {
  const customFieldsText = lead.custom_fields && Object.keys(lead.custom_fields).length > 0
    ? Object.entries(lead.custom_fields)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")
    : null;

  const leadContext = [
    `- Nome: ${lead.name}`,
    lead.company ? `- Empresa: ${lead.company}` : null,
    lead.job_title ? `- Cargo: ${lead.job_title}` : null,
    lead.source ? `- Origem: ${lead.source}` : null,
    lead.notes ? `- Observações: ${lead.notes}` : null,
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { lead, campaign } = body;

    if (!lead || !campaign) {
      return new Response(
        JSON.stringify({ error: "Missing lead or campaign data" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(lead, campaign);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${err}` }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const parsed = parseGeminiJson(rawText);

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
