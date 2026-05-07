ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS stage_transition_rules jsonb DEFAULT '{}'::jsonb;
