-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Workspaces
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now(),
  owner_id uuid references auth.users(id) not null
);

-- 2. Profiles (Users in a Workspace)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  full_name text,
  role text check (role in ('admin', 'member')) default 'member',
  created_at timestamp with time zone default now()
);

-- 3. Field Definitions (Custom Fields per Workspace)
create table field_definitions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  type text check (type in ('text', 'number', 'boolean', 'select')) default 'text',
  is_required_at_stage jsonb default '{}'::jsonb, -- Map stage_name -> boolean
  created_at timestamp with time zone default now()
);

-- 4. Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  job_title text,
  source text,
  notes text,
  status text not null default 'Base',
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Lead Custom Fields
create table lead_custom_fields (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  field_definition_id uuid references field_definitions(id) on delete cascade,
  value text,
  unique(lead_id, field_definition_id)
);

-- 6. Campaigns
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  context text,
  prompt_template text,
  trigger_stage text, -- Stage that triggers auto-gen
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 7. Generated Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  content text not null,
  status text check (status in ('draft', 'sent')) default 'draft',
  created_at timestamp with time zone default now()
);

-- RLS POLICIES

alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table field_definitions enable row level security;
alter table leads enable row level security;
alter table lead_custom_fields enable row level security;
alter table campaigns enable row level security;
alter table messages enable row level security;

-- Simple Policy: User can only see data from their workspace
-- First, a helper function to get current user's workspace_id
create or replace function get_my_workspace()
returns uuid as $$
  select workspace_id from profiles where id = auth.uid();
$$ language sql stable;

-- Workspaces: owner can see it
create policy "Users can see their own workspace"
on workspaces for all using (auth.uid() = owner_id);

-- Profiles: members of same workspace can see each other
create policy "Workspace members can see profiles"
on profiles for all using (workspace_id = (select workspace_id from profiles where id = auth.uid()));

-- Leads: members of workspace can see leads
create policy "Workspace members can see leads"
on leads for all using (workspace_id = get_my_workspace());

-- Custom Fields Definitions
create policy "Workspace members can see field definitions"
on field_definitions for all using (workspace_id = get_my_workspace());

-- Lead Custom Fields Values
create policy "Workspace members can see lead custom fields"
on lead_custom_fields for all using (
  lead_id in (select id from leads where workspace_id = get_my_workspace())
);

-- Campaigns
create policy "Workspace members can see campaigns"
on campaigns for all using (workspace_id = get_my_workspace());

-- Messages
create policy "Workspace members can see messages"
on messages for all using (
  lead_id in (select id from leads where workspace_id = get_my_workspace())
);
