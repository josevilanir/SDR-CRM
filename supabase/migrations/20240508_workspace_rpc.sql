-- Atomic RPC to create workspace + profile for a new user.
-- SECURITY DEFINER bypasses RLS to solve the bootstrapping problem:
-- a brand-new user has no profile row yet, so the profiles RLS policy
-- would block a direct INSERT from the client.
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

  insert into profiles (id, workspace_id, full_name, role)
  values (auth.uid(), new_workspace_id, user_full_name, 'admin');

  return new_workspace_id;
end;
$$;
