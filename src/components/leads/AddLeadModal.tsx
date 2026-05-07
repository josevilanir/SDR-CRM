import { useState } from 'react';
import { X } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { cn } from '../../utils/cn';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { addLead } = useLeads();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    source: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addLead({
        ...formData,
        status: 'Base',
        assigned_to: null
      });
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        source: '',
        notes: ''
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
