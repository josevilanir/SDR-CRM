export const STAGES = [
  'Base',
  'Lead Mapeado',
  'Tentando Contato',
  'Conexão Iniciada',
  'Desqualificado',
  'Qualificado',
  'Reunião Agendada',
] as const;

export type Stage = typeof STAGES[number];
