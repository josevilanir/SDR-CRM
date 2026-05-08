import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import type { Profile, WorkspaceInvite } from '../types';

export function useMembers() {
  const { workspace } = useWorkspace();
  const [members, setMembers] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const [{ data: membersData }, { data: invitesData }] = await Promise.all([
        supabase
          .from('workspace_members')
          .select(`
            role,
            profiles (
              id,
              full_name,
              email,
              created_at
            )
          `)
          .eq('workspace_id', workspace.id),
        supabase
          .from('workspace_invites')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false }),
      ]);

      // Flatten the join result to match Profile interface
      const flattenedMembers = (membersData?.map((m: any) => {
        const profile = m.profiles;
        return {
          ...profile,
          role: m.role,
          workspace_id: workspace.id
        };
      }) || []) as Profile[];

      setMembers(flattenedMembers);
      setInvites(invitesData ?? []);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const generateInvite = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_workspace_invite');
    if (error) throw error;
    await fetchMembers();
    return data as string;
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from('workspace_invites').delete().eq('id', id);
    if (error) throw error;
    setInvites((prev) => prev.filter((i) => i.id !== id));
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, invites, loading, fetchMembers, generateInvite, revokeInvite };
}
