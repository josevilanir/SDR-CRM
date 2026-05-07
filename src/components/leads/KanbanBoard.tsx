import { DndContext, type DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { LeadDetail } from './LeadDetail';
import { supabase } from '../../lib/supabase';
import type { Lead, FieldDefinition } from '../../types';

export const STAGES = [
  'Base',
  'Lead Mapeado',
  'Tentando Contato',
  'Conexão Iniciada',
  'Desqualificado',
  'Qualificado',
  'Reunião Agendada'
];

const FIELD_LABELS: Record<string, string> = {
  email: 'E-mail', phone: 'Telefone', company: 'Empresa',
  job_title: 'Cargo', source: 'Origem', notes: 'Observações',
};

export function KanbanBoard({ leads, loading, refresh, moveLead, fieldDefinitions = [], stageRules = {} }: {
  leads: any[],
  loading: boolean,
  refresh: () => void,
  moveLead: (id: string, status: string) => Promise<void>,
  fieldDefinitions?: FieldDefinition[],
  stageRules?: Record<string, string[]>,
}) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveLead(event.active.data.current.lead);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id as string;
      const lead = leads.find(l => l.id === active.id);

      // Validação campos padrão — usa regras configuradas pelo usuário
      const requiredStandardFields = stageRules[newStatus] ?? [];
      const missingStandard = requiredStandardFields.filter(
        (field) => !lead?.[field as keyof typeof lead]
      );
      if (missingStandard.length > 0) {
        const labels = missingStandard.map(f => FIELD_LABELS[f] ?? f).join(', ');
        alert(`Para mover para "${newStatus}", os seguintes campos são obrigatórios: ${labels}`);
        return;
      }

      // Validação campos personalizados configurados com is_required_at_stage
      const requiredCustomFields = fieldDefinitions.filter(
        fd => fd.is_required_at_stage?.[newStatus] === true
      );

      if (requiredCustomFields.length > 0) {
        const { data: cfValues } = await supabase
          .from('lead_custom_fields')
          .select('field_definition_id, value')
          .eq('lead_id', active.id);

        const missing = requiredCustomFields.filter(fd => {
          const val = cfValues?.find(cf => cf.field_definition_id === fd.id)?.value;
          return !val || val.trim() === '';
        });

        if (missing.length > 0) {
          alert(`Para mover para "${newStatus}", os seguintes campos são obrigatórios: ${missing.map(f => f.name).join(', ')}`);
          return;
        }
      }

      await moveLead(active.id as string, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[300px] flex-1 animate-pulse">
            <div className="h-6 w-32 bg-secondary rounded mb-4" />
            <div className="h-[500px] bg-secondary/50 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[600px]">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              id={stage}
              title={stage}
              leads={leads.filter((l) => l.status === stage)}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="w-[300px] rotate-3 opacity-90 scale-105 pointer-events-none">
              <LeadCard lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadDetail
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={() => { setSelectedLead(null); refresh(); }}
      />
    </>
  );
}
