import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import type { Campaign } from '../types';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspace } = useWorkspace();

  const fetchCampaigns = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at' | 'workspace_id'>) => {
    if (!workspace) return;
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaign, workspace_id: workspace.id }])
      .select()
      .single();
    if (error) throw error;
    setCampaigns(prev => [data, ...prev]);
    return data;
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const { error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return { campaigns, loading, addCampaign, updateCampaign, deleteCampaign, refresh: fetchCampaigns };
}
