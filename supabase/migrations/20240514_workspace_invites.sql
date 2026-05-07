-- Workspace invites: allow users to join an existing workspace via invite codes.

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text unique not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

alter table public.workspace_invites enable row level security;

-- Helper: return current user's role (SECURITY DEFINER avoids RLS recursion)
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from profiles where id = auth.uid();
$$;

-- Only workspace admins can see and manage their workspace's invites
create policy "Workspace admins can manage invites"
on public.workspace_invites for all
using (
  workspace_id = get_my_workspace()
  and get_my_role() = 'admin'
)
with check (
  workspace_id = get_my_workspace()
  and get_my_role() = 'admin'
);

-- RPC: Generate a new invite code (admin only, 8-char uppercase hex)
create or replace function public.generate_workspace_invite()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_workspace_id uuid;
  v_role text;
begin
  select workspace_id, role::text into v_workspace_id, v_role
  from profiles where id = auth.uid();

  if v_workspace_id is null then
    raise exception 'Nenhum workspace encontrado';
  end if;

  if v_role <> 'admin' then
    raise exception 'Apenas administradores podem gerar convites';
  end if;

  loop
    v_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from workspace_invites where code = v_code);
  end loop;

  insert into workspace_invites (workspace_id, code, created_by)
  values (v_workspace_id, v_code, auth.uid());

  return v_code;
end;
$$;

-- RPC: Join a workspace using an invite code (any authenticated user)
create or replace function public.join_workspace(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
begin
  select * into v_invite
  from workspace_invites
  where code = upper(trim(p_invite_code))
    and expires_at > now();

  if v_invite is null then
    raise exception 'Código de convite inválido ou expirado';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Você já pertence a um workspace';
  end if;

  insert into profiles (id, workspace_id, full_name, role)
  values (auth.uid(), v_invite.workspace_id, null, 'member');

  return v_invite.workspace_id;
end;
$$;
