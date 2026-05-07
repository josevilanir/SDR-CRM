export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface Profile {
  id: string;
  workspace_id: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  source: string | null;
  notes: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  context: string;
  prompt_template: string;
  trigger_stage: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  lead_id: string;
  campaign_id: string;
  content: string;
  status: 'draft' | 'sent';
  created_at: string;
}

export interface FieldDefinition {
  id: string;
  workspace_id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  created_at: string;
}

export interface LeadCustomField {
  id: string;
  lead_id: string;
  field_definition_id: string;
  value: string | null;
}
