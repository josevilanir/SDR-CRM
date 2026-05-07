import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import type { Lead } from '../types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspace } = useWorkspace();

  const fetchLeads = useCallback(async () => {
    if (!workspace) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => {
    if (!workspace) return;

    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, workspace_id: workspace.id }])
      .select()
      .single();

    if (error) throw error;
    setLeads([data, ...leads]);
    return data;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const moveLead = async (id: string, newStatus: string) => {
    await updateLead(id, { status: newStatus, updated_at: new Date().toISOString() });
  };

  return {
    leads,
    loading,
    addLead,
    updateLead,
    moveLead,
    refresh: fetchLeads
  };
}
