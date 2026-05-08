-- Create Activity Log table
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  lead_id uuid references leads(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  action text not null, -- 'move', 'create', 'update', 'message_gen'
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table activity_logs enable row level security;

-- Policy
create policy "Workspace members can see activity logs"
on activity_logs for all using (workspace_id = (select workspace_id from profiles where id = auth.uid()));

-- Trigger to log stage changes automatically
create or replace function log_lead_stage_change()
returns trigger as $$
begin
  if (old.status is distinct from new.status) then
    insert into activity_logs (workspace_id, lead_id, user_id, action, details)
    values (
      new.workspace_id,
      new.id,
      auth.uid(),
      'move',
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger lead_stage_change_trigger
after update on leads
for each row execute function log_lead_stage_change();
