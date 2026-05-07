import { KanbanBoard } from '../components/leads/KanbanBoard';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddLeadModal } from '../components/leads/AddLeadModal';
import { useLeads } from '../hooks/useLeads';

export function Kanban() {
  const { leads, loading, refresh, moveLead, addLead } = useLeads();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Funil de Vendas</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary gap-2"
        >
          <Plus size={20} /> Novo Lead
        </button>
      </div>
      
      <div className="flex-1 min-h-0">
        <KanbanBoard leads={leads} loading={loading} refresh={refresh} moveLead={moveLead} />
      </div>

      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onLeadAdded={refresh}
        addLead={addLead}
      />
    </div>
  );
}
