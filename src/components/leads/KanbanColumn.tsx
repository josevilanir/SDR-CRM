import { useDroppable } from '@dnd-kit/core';
import { LeadCard } from './LeadCard';
import type { Lead } from '../../types';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
}

export function KanbanColumn({ id, title, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex-1 min-w-[300px] flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {title}
          <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] text-muted-foreground">
            {leads.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-3 rounded-2xl transition-colors min-h-[500px]",
          isOver ? "bg-primary/5 border-2 border-dashed border-primary/20" : "bg-black/20 border-2 border-transparent"
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
}
