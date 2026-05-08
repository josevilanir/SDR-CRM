import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';

// Default rules applied when workspace has no saved configuration yet
const DEFAULT_RULES: Record<string, string[]> = {
  'Lead Mapeado': ['company', 'job_title'],
  'Tentando Contato': ['company', 'job_title'],
  'Qualificado': ['email', 'company', 'job_title'],
  'Reunião Agendada': ['email', 'phone', 'company', 'job_title'],
};

export function useStageRules() {
  const { workspace } = useWorkspace();
  const [rules, setRules] = useState<Record<string, string[]>>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('stage_transition_rules')
        .eq('id', workspace.id)
        .single();

      const saved = data?.stage_transition_rules;
      // Use saved rules if they exist, otherwise fall back to defaults
      setRules(saved && Object.keys(saved).length > 0 ? saved : DEFAULT_RULES);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const saveRules = async (newRules: Record<string, string[]>) => {
    if (!workspace) return;
    const { error } = await supabase
      .from('workspaces')
      .update({ stage_transition_rules: newRules })
      .eq('id', workspace.id);
    
    if (error) {
      console.error('Error saving rules:', error);
      throw error;
    }
    
    setRules(newRules);
  };

  return { rules, loading, saveRules };
}
