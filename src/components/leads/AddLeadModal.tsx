import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { Profile } from '../../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded?: () => void;
  addLead: (lead: any) => Promise<any>;
}

export function AddLeadModal({ isOpen, onClose, onLeadAdded, addLead }: AddLeadModalProps) {
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<Profile[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    source: '',
    notes: '',
    assigned_to: '',
  });

  useEffect(() => {
    if (!workspace || !isOpen) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('workspace_id', workspace.id)
      .then(({ data }) => setWorkspaceMembers(data ?? []));
  }, [workspace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addLead({
        ...formData,
        status: 'Base',
        assigned_to: formData.assigned_to || null,
      });
      onLeadAdded?.();
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        source: '',
        notes: '',
        assigned_to: '',
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="glass-card w-full max-w-xl p-8 relative z-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Novo Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">E-mail</label>
              <input
                type="email"
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Telefone</label>
              <input
                type="text"
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Empresa</label>
              <input
                type="text"
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Cargo</label>
              <input
                type="text"
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Origem do Lead</label>
              <input
                type="text"
                placeholder="Ex: LinkedIn, Indicação, Site..."
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Responsável</label>
              <select
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              >
                <option value="">Sem responsável</option>
                {workspaceMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email || `Usuário ${m.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium block mb-1">Observações</label>
              <textarea
                className="w-full bg-secondary border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary py-2.5"
            >
              {loading ? 'Salvando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
