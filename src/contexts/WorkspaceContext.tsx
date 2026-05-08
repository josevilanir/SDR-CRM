import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Workspace } from '../types';

interface WorkspaceContextValue {
  profile: Profile | null;
  workspace: Workspace | null;
  workspaces: Workspace[]; // New: List of all user's workspaces
  loading: boolean;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>; // New: Function to switch active workspace
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchWorkspaceData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setWorkspace(null);
        setWorkspaces([]);
        isLoadedRef.current = false;
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
        setWorkspaces([]);
        isLoadedRef.current = false;
        return;
      }

      setProfile(profileData);

      // Fetch ALL workspaces this user belongs to
      const { data: membershipData } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .eq('profile_id', user.id);

      const userWorkspaces = (membershipData?.map(m => m.workspaces) ?? []) as Workspace[];
      setWorkspaces(userWorkspaces);

      // Current active workspace
      const activeWorkspace = userWorkspaces.find(w => w.id === profileData.workspace_id) || null;
      setWorkspace(activeWorkspace);
      isLoadedRef.current = !!activeWorkspace;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const switchWorkspace = async (workspaceId: string) => {
    if (!profile) return;
    
    // Find the membership for the role
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('profile_id', profile.id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!member) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        workspace_id: workspaceId,
        role: member.role 
      })
      .eq('id', profile.id);

    if (error) throw error;
    
    // Refresh all data
    isLoadedRef.current = false;
    await fetchWorkspaceData();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) throw error;
    setProfile({ ...profile, ...updates });
  };

  useEffect(() => {
    fetchWorkspaceData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !isLoadedRef.current) {
        fetchWorkspaceData();
      } else if (event === 'SIGNED_OUT') {
        isLoadedRef.current = false;
        isFetchingRef.current = false;
        setProfile(null);
        setWorkspace(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchWorkspaceData]);

  return (
    <WorkspaceContext.Provider value={{ profile, workspace, workspaces, loading, refresh: fetchWorkspaceData, updateProfile, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
