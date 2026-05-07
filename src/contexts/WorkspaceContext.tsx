import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Workspace } from '../types';

interface WorkspaceContextValue {
  profile: Profile | null;
  workspace: Workspace | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setWorkspace(null);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData) {
        setProfile(null);
        setWorkspace(null);
        return;
      }

      setProfile(profileData);

      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', profileData.workspace_id)
        .maybeSingle();

      setWorkspace(workspaceData ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWorkspaceData();
    });

    return () => subscription.unsubscribe();
  }, [fetchWorkspaceData]);

  return (
    <WorkspaceContext.Provider value={{ profile, workspace, loading, refresh: fetchWorkspaceData }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
