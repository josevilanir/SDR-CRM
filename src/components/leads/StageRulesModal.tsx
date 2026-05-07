import { useState } from 'react';
import { X, Save, Settings2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STAGES } from '../../constants/stages';

const STANDARD_FIELDS: { key: string; label: string }[] = [
  { key: 'email', label: 'E-mail' },
  { key: 'phone', label: 'Telefone' },
  { key: 'company', label: 'Empresa' },
  { key: 'job_title', label: 'Cargo' },
  { key: 'source', label: 'Origem' },
  { key: 'notes', label: 'Obs.' },
];

interface StageRulesModalProps {
  rules: Record<string, string[]>;
  onSave: (rules: Record<string, string[]>) => Promise<void>;
  onClose: () => void;
}

export function StageRulesModal({ rules, onSave, onClose }: StageRulesModalProps) {
  const [localRules, setLocalRules] = useState<Record<string, string[]>>(
    () => {
      // Deep copy
      const copy: Record<string, string[]> = {};
      STAGES.forEach(s => { copy[s] = [...(rules[s] ?? [])]; });
      return copy;
    }
  );
  const [saving, setSaving] = useState(false);

  const toggle = (stage: string, field: string) => {
    setLocalRules(prev => {
      const current = prev[stage] ?? [];
      const updated = current.includes(field)
        ? current.filter(f => f !== field)
        : [...current, field];
      return { ...prev, [stage]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localRules);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="glass-card w-full max-w-3xl relative z-10 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Settings2 size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Regras do Funil</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure quais campos são obrigatórios para mover um lead para cada etapa
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-44">
                  Etapa
                </th>
                {STANDARD_FIELDS.map(f => (
                  <th key={f.key} className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAGES.map((stage, idx) => (
                <tr
                  key={stage}
                  className={cn(
                    "border-t border-border/40",
                    idx % 2 === 0 ? "bg-secondary/10" : "bg-transparent"
                  )}
                >
                  <td className="py-3 pr-4 font-medium text-sm">{stage}</td>
                  {STANDARD_FIELDS.map(f => {
                    const checked = localRules[stage]?.includes(f.key) ?? false;
                    return (
                      <td key={f.key} className="text-center py-3 px-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(stage, f.key)}
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-muted-foreground mt-4">
            Os campos marcados devem estar preenchidos para que o lead possa ser movido para a etapa correspondente.
            Campos personalizados podem ser configurados individualmente na edição de cada campo.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex-shrink-0 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary gap-2 px-5 py-2.5"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Regras'}
          </button>
        </div>
      </div>
    </div>
  );
}
