-- Update join_workspace to accept and store user_full_name
create or replace function public.join_workspace(
  p_invite_code text,
  user_full_name text default null
)
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
  select auth.uid(), v_invite.workspace_id, user_full_name, u.email, 'member'
  from auth.users u
  where u.id = auth.uid();

  return v_invite.workspace_id;
end;
$$;
