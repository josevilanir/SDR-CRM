-- Remove policy created manually via dashboard that caused infinite recursion.
-- It used a direct inline subquery on profiles itself (not SECURITY DEFINER),
-- which triggered RLS re-evaluation → stack overflow → 500.
-- The safe equivalent already exists: "Ver outros membros do workspace"
-- which calls get_my_workspace() (SECURITY DEFINER).
DROP POLICY IF EXISTS "Members of same workspace can view each other" ON profiles;
