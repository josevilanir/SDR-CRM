import { KanbanBoard } from '../components/leads/KanbanBoard';
import { StageRulesModal } from '../components/leads/StageRulesModal';
import { Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { AddLeadModal } from '../components/leads/AddLeadModal';
import { useLeads } from '../hooks/useLeads';
import { useCustomFields } from '../hooks/useCustomFields';
import { useStageRules } from '../hooks/useStageRules';

export function Kanban() {
  const { leads, loading, refresh, moveLead, addLead } = useLeads();
  const { fieldDefinitions } = useCustomFields();
  const { rules, saveRules } = useStageRules();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Funil de Vendas</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
          >
            <Settings2 size={16} /> Regras do Funil
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary gap-2"
          >
            <Plus size={20} /> Novo Lead
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard
          leads={leads}
          loading={loading}
          refresh={refresh}
          moveLead={moveLead}
          fieldDefinitions={fieldDefinitions}
          stageRules={rules}
        />
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={refresh}
        addLead={addLead}
      />

      {isRulesModalOpen && (
        <StageRulesModal
          rules={rules}
          onSave={saveRules}
          onClose={() => setIsRulesModalOpen(false)}
        />
      )}
    </div>
  );
}
