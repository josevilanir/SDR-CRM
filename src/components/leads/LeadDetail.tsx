import { useState, useEffect, useCallback } from 'react';
import {
  X, Mail, Phone, Building2, User, Save, Megaphone,
  Sparkles, Copy, Send, ChevronDown, Plus, Loader2,
  Check, AlertCircle, SlidersHorizontal, RefreshCw, Bot, Trash2, MinusCircle
} from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCustomFields } from '../../hooks/useCustomFields';
import { supabase } from '../../lib/supabase';
import type { Lead, Campaign, Message } from '../../types';
import { cn } from '../../utils/cn';

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

export function LeadDetail({ lead, onClose, onLeadUpdated }: LeadDetailProps) {
  const { updateLead, deleteLead, moveLead } = useLeads();
  const { campaigns } = useCampaigns();
  const { fieldDefinitions, getValueForField, upsertFieldValue, addFieldDefinition, deleteFieldDefinition } = useCustomFields(lead?.id);

  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);

  // Saved messages from DB
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Manual generator state
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Custom fields UI
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  const loadMessages = useCallback(async (leadId: string) => {
    setLoadingMessages(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false });
      setSavedMessages(data ?? []);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setAiError(null);
      setSelectedCampaign(null);
      setShowGenerator(false);
      loadMessages(lead.id);
    }
  }, [lead, loadMessages]);

  if (!lead) return null;

  const activeCampaigns = campaigns.filter((c) => c.is_active);

  const getCampaignName = (campaignId: string) =>
    campaigns.find((c) => c.id === campaignId)?.name ?? 'Campanha';

  // Group draft messages by campaign for display
  const messagesByCampaign = savedMessages.reduce<Record<string, Message[]>>((acc, msg) => {
    if (!acc[msg.campaign_id]) acc[msg.campaign_id] = [];
    acc[msg.campaign_id].push(msg);
    return acc;
  }, {});

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLead(lead.id, formData);
      onLeadUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar lead');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateMessages = async () => {
    if (!selectedCampaign) return;
    setGenerating(true);
    setAiError(null);

    try {
      const customFieldsMap: Record<string, string> = {};
      for (const def of fieldDefinitions) {
        const val = getValueForField(def.id);
        if (val) customFieldsMap[def.name] = val;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          lead: {
            name: lead.name,
            company: lead.company,
            job_title: lead.job_title,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            notes: lead.notes,
            custom_fields: customFieldsMap,
          },
          campaign: {
            name: selectedCampaign.name,
            context: selectedCampaign.context,
            prompt_template: selectedCampaign.prompt_template,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Erro ao gerar mensagens');

      const newVariations: { label: string; text: string }[] = result.variations ?? [];

      // Delete old drafts for this campaign+lead before saving new ones
      await supabase
        .from('messages')
        .delete()
        .eq('lead_id', lead.id)
        .eq('campaign_id', selectedCampaign.id)
        .eq('status', 'draft');

      // Persist new variations
      await supabase.from('messages').insert(
        newVariations.map((v) => ({
          lead_id: lead.id,
          campaign_id: selectedCampaign.id,
          content: v.text,
          label: v.label,
          status: 'draft',
        }))
      );

      await loadMessages(lead.id);
      setShowGenerator(false);
      setSelectedCampaign(null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Erro inesperado ao chamar a IA');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (messageId: string) => {
    setSendingId(messageId);
    try {
      await supabase.from('messages').update({ status: 'sent' }).eq('id', messageId);
      await updateLead(lead.id, { status: 'Tentando Contato', updated_at: new Date().toISOString() });
      onLeadUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (!confirm('Tem certeza que deseja excluir este lead? Todas as mensagens geradas também serão apagadas.')) return;
    
    setSaving(true);
    try {
      await deleteLead(lead.id);
      onLeadUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir lead');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;
    await addFieldDefinition(newFieldName.trim(), 'text');
    setNewFieldName('');
    setAddingField(false);
  };

  const hasSavedMessages = savedMessages.length > 0;

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border z-[100] shadow-2xl transition-transform duration-300 transform",
      lead ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">{lead.name}</h2>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{lead.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Informações Básicas */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail size={10} /> E-mail
                </label>
                <input
                  type="email"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.email ?? ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone size={10} /> Telefone
                </label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.phone ?? ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Building2 size={10} /> Empresa
                </label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.company ?? ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cargo</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.job_title ?? ''}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Campos Personalizados */}
          <section className="space-y-3" key={`custom-fields-${lead.id}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={12} /> Campos Personalizados
              </h3>
              <button
                onClick={() => setAddingField(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={11} /> Novo campo
              </button>
            </div>

            {fieldDefinitions.length === 0 && !addingField ? (
              <p className="text-xs text-muted-foreground italic">
                Nenhum campo personalizado. Clique em "Novo campo" para adicionar.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {fieldDefinitions.map((def) => (
                  <div key={def.id} className="group relative">
                    <label className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                      {def.name}
                      <button
                        onClick={async () => {
                          if (confirm(`Excluir o campo "${def.name}" de todos os leads?`)) {
                            await deleteFieldDefinition(def.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all"
                        title="Remover campo"
                      >
                        <MinusCircle size={12} />
                      </button>
                    </label>
                    <input
                      type={def.type === 'number' ? 'number' : 'text'}
                      className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      value={getValueForField(def.id)}
                      onChange={(e) => upsertFieldValue(def.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {addingField && (
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome do campo..."
                  className="flex-1 bg-secondary/50 border border-primary/50 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddField();
                    if (e.key === 'Escape') setAddingField(false);
                  }}
                />
                <button onClick={handleAddField} className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Check size={14} />
                </button>
                <button onClick={() => { setAddingField(false); setNewFieldName(''); }} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
          </section>

          {/* Notas */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notas e Observações</h3>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none h-28 resize-none"
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre o lead..."
            />
          </section>

          {/* IA - Mensagens */}
          <section className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Mensagens com IA
                </h3>
              </div>
              {hasSavedMessages && (
                <button
                  onClick={() => { setShowGenerator(true); setSelectedCampaign(null); setAiError(null); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <RefreshCw size={12} /> Regenerar
                </button>
              )}
            </div>

            {/* Pre-generated messages from DB */}
            {loadingMessages ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 size={13} className="animate-spin" /> Carregando mensagens pré-geradas...
              </div>
            ) : hasSavedMessages ? (
              <div className="space-y-5">
                {Object.entries(messagesByCampaign).map(([campaignId, msgs]) => (
                  <div key={campaignId} className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Bot size={12} className="text-primary" />
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                        {getCampaignName(campaignId)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">gerado automaticamente</span>
                    </div>

                    {msgs.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-background/60 border border-border/60 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors"
                      >
                        {msg.label && (
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            {msg.label}
                          </span>
                        )}
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
                          >
                            {copiedId === msg.id
                              ? <><Check size={12} className="text-emerald-500" /> Copiado!</>
                              : <><Copy size={12} /> Copiar</>}
                          </button>
                          <button
                            onClick={() => handleSend(msg.id)}
                            disabled={sendingId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            {sendingId === msg.id
                              ? <><Loader2 size={12} className="animate-spin" /> Enviando...</>
                              : <><Send size={12} /> Enviar</>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Manual generator — shown when no pre-generated messages OR user clicked Regenerar */}
            {(!hasSavedMessages || showGenerator) && !loadingMessages && (
              <>
                {activeCampaigns.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhuma campanha ativa. Crie uma campanha para gerar mensagens.
                  </p>
                ) : (
                  <>
                    <div className="relative">
                      <select
                        className="w-full bg-background/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        value={selectedCampaign?.id ?? ''}
                        onChange={(e) => {
                          const camp = activeCampaigns.find((c) => c.id === e.target.value) ?? null;
                          setSelectedCampaign(camp);
                          setAiError(null);
                        }}
                      >
                        <option value="">Selecione uma campanha...</option>
                        {activeCampaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    <button
                      onClick={handleGenerateMessages}
                      disabled={!selectedCampaign || generating}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        selectedCampaign && !generating
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {generating
                        ? <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                        : <><Megaphone size={15} /> {hasSavedMessages ? 'Regenerar Sugestões' : 'Gerar Sugestões'}</>}
                    </button>
                  </>
                )}
              </>
            )}

            {aiError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle size={14} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{aiError}</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex-shrink-0 flex gap-3">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="p-2.5 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center"
            title="Excluir Lead"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 gap-2"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
