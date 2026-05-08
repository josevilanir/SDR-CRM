import { useState, useEffect } from 'react';
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
  const { workspace, refresh } = useWorkspace();
  const [rules, setRules] = useState<Record<string, string[]>>(DEFAULT_RULES);
  const [loading] = useState(false);

  // Update local rules whenever workspace changes
  useEffect(() => {
    if (workspace?.stage_transition_rules && Object.keys(workspace.stage_transition_rules).length > 0) {
      setRules(workspace.stage_transition_rules);
    } else {
      setRules(DEFAULT_RULES);
    }
  }, [workspace]);

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
    await refresh(); // Force workspace context to update
  };

  return { rules, loading, saveRules };
}
