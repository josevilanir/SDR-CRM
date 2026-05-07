import { useState } from 'react';
import {
  Megaphone, Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight,
  Target, FileText, Zap, ChevronDown
} from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import type { Campaign } from '../types';
import { cn } from '../utils/cn';
import { STAGES } from '../constants/stages';

const EMPTY_FORM: Omit<Campaign, 'id' | 'created_at' | 'workspace_id'> = {
  name: '',
  context: '',
  prompt_template: '',
  trigger_stage: null,
  is_active: true,
};

interface CampaignModalProps {
  campaign?: Campaign | null;
  onSave: (data: Omit<Campaign, 'id' | 'created_at' | 'workspace_id'>) => Promise<void>;
  onClose: () => void;
}

function CampaignModal({ campaign, onSave, onClose }: CampaignModalProps) {
  const [form, setForm] = useState<Omit<Campaign, 'id' | 'created_at' | 'workspace_id'>>(
    campaign ? {
      name: campaign.name,
      context: campaign.context,
      prompt_template: campaign.prompt_template,
      trigger_stage: campaign.trigger_stage,
      is_active: campaign.is_active,
    } : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.context.trim()) return;
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="glass-card w-full max-w-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Megaphone size={20} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{campaign ? 'Editar Campanha' : 'Nova Campanha'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-foreground/80 block mb-2">
              Nome da Campanha *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Prospecção Q3 2025"
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Contexto */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-primary" />
              <label className="text-sm font-semibold text-foreground/80">Contexto da Oferta / Produto *</label>
            </div>
            <textarea
              required
              placeholder="Descreva o produto ou oferta que está sendo promovida. Ex: Plataforma de gestão financeira para PMEs com foco em fluxo de caixa..."
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all h-28 resize-none"
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
            />
          </div>

          {/* Prompt Template */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-primary" />
              <label className="text-sm font-semibold text-foreground/80">Persona / Tom de Voz</label>
            </div>
            <textarea
              placeholder="Descreva como a IA deve se comunicar. Ex: Você é um SDR consultivo, direto mas empático, que foca em entender a dor do cliente antes de apresentar a solução..."
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all h-28 resize-none"
              value={form.prompt_template}
              onChange={(e) => setForm({ ...form, prompt_template: e.target.value })}
            />
          </div>

          {/* Etapa Gatilho */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-primary" />
              <label className="text-sm font-semibold text-foreground/80">Etapa Gatilho</label>
            </div>
            <div className="relative">
              <select
                className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                value={form.trigger_stage ?? ''}
                onChange={(e) => setForm({ ...form, trigger_stage: e.target.value || null })}
              >
                <option value="">Nenhuma (apenas manual)</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Quando definida, sugestões de mensagem serão geradas automaticamente ao mover um lead para essa etapa.
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
            <div>
              <p className="text-sm font-semibold">Campanha Ativa</p>
              <p className="text-xs text-muted-foreground mt-0.5">Apenas campanhas ativas aparecem na geração de mensagens</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className="transition-colors"
            >
              {form.is_active
                ? <ToggleRight size={32} className="text-primary" />
                : <ToggleLeft size={32} className="text-muted-foreground" />}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary py-3 gap-2 text-sm"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : campaign ? 'Salvar Alterações' : 'Criar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Campaigns() {
  const { campaigns, loading, addCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleSave = async (data: Omit<Campaign, 'id' | 'created_at' | 'workspace_id'>) => {
    if (editingCampaign) {
      await updateCampaign(editingCampaign.id, data);
    } else {
      await addCampaign(data);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta campanha? Esta ação não pode ser desfeita.')) return;
    await deleteCampaign(id);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas campanhas de prospecção e automação com IA
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary gap-2"
        >
          <Plus size={18} /> Nova Campanha
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
              <div className="h-5 w-40 bg-secondary rounded" />
              <div className="h-3 w-full bg-secondary rounded" />
              <div className="h-3 w-3/4 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Crie sua primeira campanha para começar a gerar mensagens personalizadas com IA.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary gap-2 mx-auto">
            <Plus size={18} /> Criar primeira campanha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => handleEdit(campaign)}
              onDelete={() => handleDelete(campaign.id)}
              onToggle={() => updateCampaign(campaign.id, { is_active: !campaign.is_active })}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CampaignModal
          campaign={editingCampaign}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function CampaignCard({ campaign, onEdit, onDelete, onToggle }: CampaignCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl border transition-all duration-200 flex flex-col gap-4 group hover:border-primary/30",
      campaign.is_active ? "border-border" : "border-border/40 opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            campaign.is_active ? "bg-primary/15" : "bg-secondary"
          )}>
            <Megaphone size={16} className={campaign.is_active ? "text-primary" : "text-muted-foreground"} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate">{campaign.name}</h3>
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              campaign.is_active ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {campaign.is_active ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Context preview */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Target size={12} />
          <span className="font-medium uppercase tracking-wider">Contexto</span>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-3">{campaign.context || '—'}</p>
      </div>

      {/* Trigger stage */}
      {campaign.trigger_stage && (
        <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
          <Zap size={13} className="text-primary flex-shrink-0" />
          <span className="text-xs text-primary font-medium">Gatilho: {campaign.trigger_stage}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
        </span>
        <button
          onClick={onToggle}
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-lg transition-colors",
            campaign.is_active
              ? "bg-secondary hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              : "bg-primary/10 hover:bg-primary/20 text-primary"
          )}
        >
          {campaign.is_active ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  );
}
