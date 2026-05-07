import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Building2, User } from 'lucide-react';
import type { Lead } from '../../types';
import { cn } from '../../utils/cn';

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(lead)}
      className={cn(
        "glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 group",
        isDragging && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
          {lead.name}
        </h4>
        <User size={14} className="text-muted-foreground" />
      </div>
      
      <div className="space-y-1.5">
        {lead.company && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 size={12} />
            <span>{lead.company}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={12} />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone size={12} />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Criado em {new Date(lead.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
