import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import type { FieldDefinition, LeadCustomField } from '../types';

export function useCustomFields(leadId?: string) {
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<LeadCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspace } = useWorkspace();

  const fetchFieldDefinitions = useCallback(async () => {
    if (!workspace) return;
    const { data, error } = await supabase
      .from('field_definitions')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    setFieldDefinitions(data || []);
  }, [workspace]);

  const fetchCustomFieldValues = useCallback(async () => {
    if (!leadId) {
      setCustomFieldValues([]);
      return;
    }
    const { data, error } = await supabase
      .from('lead_custom_fields')
      .select('*')
      .eq('lead_id', leadId);
    if (error) throw error;
    setCustomFieldValues(data || []);
  }, [leadId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFieldDefinitions(), fetchCustomFieldValues()]).finally(() => setLoading(false));
  }, [fetchFieldDefinitions, fetchCustomFieldValues]);

  const upsertFieldValue = async (fieldDefinitionId: string, value: string) => {
    if (!leadId) return;
    const { error } = await supabase
      .from('lead_custom_fields')
      .upsert(
        { lead_id: leadId, field_definition_id: fieldDefinitionId, value },
        { onConflict: 'lead_id,field_definition_id' }
      );
    if (error) throw error;
    setCustomFieldValues(prev => {
      const exists = prev.find(f => f.field_definition_id === fieldDefinitionId);
      if (exists) return prev.map(f => f.field_definition_id === fieldDefinitionId ? { ...f, value } : f);
      return [...prev, { id: crypto.randomUUID(), lead_id: leadId, field_definition_id: fieldDefinitionId, value }];
    });
  };

  const addFieldDefinition = async (name: string, type: FieldDefinition['type'] = 'text') => {
    if (!workspace) return;
    const { data, error } = await supabase
      .from('field_definitions')
      .insert([{ workspace_id: workspace.id, name, type }])
      .select()
      .single();
    if (error) throw error;
    setFieldDefinitions(prev => [...prev, data]);
    return data;
  };

  const deleteFieldDefinition = async (id: string) => {
    const { error } = await supabase.from('field_definitions').delete().eq('id', id);
    if (error) throw error;
    setFieldDefinitions(prev => prev.filter(f => f.id !== id));
  };

  const getValueForField = (fieldDefinitionId: string) =>
    customFieldValues.find(f => f.field_definition_id === fieldDefinitionId)?.value ?? '';

  return {
    fieldDefinitions,
    customFieldValues,
    loading,
    upsertFieldValue,
    addFieldDefinition,
    deleteFieldDefinition,
    getValueForField,
  };
}
