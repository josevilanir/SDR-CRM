import { KanbanBoard, STAGES } from '../components/leads/KanbanBoard';
import { StageRulesModal } from '../components/leads/StageRulesModal';
import { Plus, Settings2, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AddLeadModal } from '../components/leads/AddLeadModal';
import { useLeads } from '../hooks/useLeads';
import { useCustomFields } from '../hooks/useCustomFields';
import { useStageRules } from '../hooks/useStageRules';
import { useMembers } from '../hooks/useMembers';

export function Kanban() {
  const { leads, loading, refresh, moveLead, addLead } = useLeads();
  const { members } = useMembers();
  const { fieldDefinitions } = useCustomFields();
  const { rules, saveRules } = useStageRules();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() ?? '').includes(search.toLowerCase());
    
    const matchesUser = filterUser === 'all' || lead.assigned_to === filterUser;
    const matchesStage = filterStage === 'all' || lead.status === filterStage;
    
    return matchesSearch && matchesUser && matchesStage;
  });

  const displayStages = filterStage === 'all' ? STAGES : [filterStage];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Funil de Vendas</h1>
        <div className="flex flex-wrap items-center gap-2">
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

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 glass-card rounded-xl">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou empresa..."
            className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter size={16} className="text-muted-foreground" />
          <select
            className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="all">Todos os responsáveis</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
          >
            <option value="all">Todas as etapas</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard
          leads={filteredLeads}
          loading={loading}
          refresh={refresh}
          moveLead={moveLead}
          fieldDefinitions={fieldDefinitions}
          stageRules={rules}
          displayStages={displayStages}
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
