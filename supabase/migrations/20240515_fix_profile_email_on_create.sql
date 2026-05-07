-- Fix: populate email from auth.users when creating profiles via RPC.
-- Root cause: both RPCs inserted profiles without the email column,
-- and the existing sync trigger only fires on UPDATE (not INSERT).

-- 1. Fix join_workspace() to pull email from auth.users at INSERT time
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

  insert into profiles (id, workspace_id, full_name, email, role)
  select auth.uid(), v_invite.workspace_id, null, u.email, 'member'
  from auth.users u
  where u.id = auth.uid();

  return v_invite.workspace_id;
end;
$$;

-- 2. Fix create_workspace_and_profile() to pull email from auth.users at INSERT time
create or replace function public.create_workspace_and_profile(
  workspace_name text,
  user_full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  insert into workspaces (name, owner_id)
  values (workspace_name, auth.uid())
  returning id into new_workspace_id;

  insert into profiles (id, workspace_id, full_name, email, role)
  select auth.uid(), new_workspace_id, user_full_name, u.email, 'admin'
  from auth.users u
  where u.id = auth.uid();

  return new_workspace_id;
end;
$$;

-- 3. Backfill existing profiles that are missing email
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;
