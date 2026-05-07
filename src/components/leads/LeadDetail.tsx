import { useState, useEffect } from 'react';
import { X, Mail, Phone, Building2, User, Save, Trash2, Megaphone } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import type { Lead } from '../../types';
import { cn } from '../../utils/cn';

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const { updateLead } = useLeads();
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateLead(lead.id, formData);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border z-[100] shadow-2xl transition-transform duration-300 transform",
      lead ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
                <input
                  type="email"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Telefone</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Empresa</label>
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

          {/* Notas */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notas e Observações</h3>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none h-32 resize-none"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre o lead..."
            />
          </section>

          {/* IA - Mensagens (Placeholder para Fase 4) */}
          <section className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <Megaphone size={16} /> Mensagens IA
              </h3>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Selecione uma campanha para gerar mensagens personalizadas.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex-1 gap-2"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
