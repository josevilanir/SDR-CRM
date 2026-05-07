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
          .from('profiles')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at'),
        supabase
          .from('workspace_invites')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false }),
      ]);
      setMembers(membersData ?? []);
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
