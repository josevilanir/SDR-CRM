-- Fix infinite recursion on profiles RLS.
--
-- Root cause 1: The profiles policy had an inline subquery on the same table:
--   USING (workspace_id = (select workspace_id from profiles where id = auth.uid()))
--   → queries profiles → triggers the policy → queries profiles → ∞
--
-- Root cause 2: get_my_workspace() queries profiles without SECURITY DEFINER,
--   so when it is called from any other table's policy it also hits profiles RLS
--   and triggers the same loop.
--
-- Fix: make get_my_workspace() SECURITY DEFINER (bypasses RLS on its internal
-- profiles SELECT), then rewrite the profiles policy to call that function.

-- 1. Replace get_my_workspace with a SECURITY DEFINER version
create or replace function get_my_workspace()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from profiles where id = auth.uid();
$$;

-- 2. Drop the recursive profiles policy and replace it with a safe one
drop policy if exists "Workspace members can see profiles" on profiles;

create policy "Workspace members can see profiles"
on profiles for all
using (workspace_id = get_my_workspace());
