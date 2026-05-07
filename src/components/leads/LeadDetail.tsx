import { useState, useEffect } from 'react';
import {
  X, Mail, Phone, Building2, User, Save, Megaphone,
  Sparkles, Copy, Send, ChevronDown, Plus, Loader2,
  Check, AlertCircle, SlidersHorizontal
} from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCustomFields } from '../../hooks/useCustomFields';
import { supabase } from '../../lib/supabase';
import type { Lead, Campaign } from '../../types';
import { cn } from '../../utils/cn';

interface MessageVariation {
  label: string;
  text: string;
}

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

export function LeadDetail({ lead, onClose, onLeadUpdated }: LeadDetailProps) {
  const { updateLead } = useLeads();
  const { campaigns } = useCampaigns();
  const { fieldDefinitions, getValueForField, upsertFieldValue, addFieldDefinition } = useCustomFields(lead?.id);

  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(false);

  // AI state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState<MessageVariation[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);

  // Custom fields new field UI
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData(lead);
      setVariations([]);
      setAiError(null);
      setSelectedCampaign(null);
    }
  }, [lead]);

  if (!lead) return null;

  const activeCampaigns = campaigns.filter(c => c.is_active);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateLead(lead.id, formData);
      onLeadUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessages = async () => {
    if (!selectedCampaign) return;
    setGenerating(true);
    setAiError(null);
    setVariations([]);

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

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar mensagens');
      }

      setVariations(result.variations || []);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Erro inesperado ao chamar a IA');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async (idx: number) => {
    setSending(idx);
    try {
      await updateLead(lead.id, { status: 'Tentando Contato', updated_at: new Date().toISOString() });
      await new Promise(r => setTimeout(r, 600));
      onLeadUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;
    await addFieldDefinition(newFieldName.trim(), 'text');
    setNewFieldName('');
    setAddingField(false);
  };

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
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <Mail size={10} /> E-mail
                </label>
                <input
                  type="email"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <Phone size={10} /> Telefone
                </label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <Building2 size={10} /> Empresa
                </label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cargo</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.job_title || ''}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Campos Personalizados */}
          <section className="space-y-3">
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
                  <div key={def.id}>
                    <label className="text-xs text-muted-foreground mb-1 block">{def.name}</label>
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
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddField(); if (e.key === 'Escape') setAddingField(false); }}
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
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre o lead..."
            />
          </section>

          {/* IA - Mensagens */}
          <section className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/15">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Mensagens com IA
              </h3>
            </div>

            {/* Campaign selector */}
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
                      const camp = activeCampaigns.find(c => c.id === e.target.value) ?? null;
                      setSelectedCampaign(camp);
                      setVariations([]);
                      setAiError(null);
                    }}
                  >
                    <option value="">Selecione uma campanha...</option>
                    {activeCampaigns.map(c => (
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
                  {generating ? (
                    <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                  ) : (
                    <><Megaphone size={15} /> Gerar Sugestões</>
                  )}
                </button>
              </>
            )}

            {/* Error state */}
            {aiError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle size={14} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{aiError}</p>
              </div>
            )}

            {/* Generated variations */}
            {variations.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {variations.length} variações geradas
                </p>
                {variations.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-background/60 border border-border/60 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{v.label}</span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{v.text}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(v.text, idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
                      >
                        {copiedIdx === idx
                          ? <><Check size={12} className="text-emerald-500" /> Copiado!</>
                          : <><Copy size={12} /> Copiar</>}
                      </button>
                      <button
                        onClick={() => handleSend(idx)}
                        disabled={sending !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        {sending === idx
                          ? <><Loader2 size={12} className="animate-spin" /> Enviando...</>
                          : <><Send size={12} /> Enviar</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary w-full gap-2"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
