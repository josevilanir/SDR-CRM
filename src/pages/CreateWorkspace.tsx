import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function CreateWorkspace() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('create_workspace_and_profile', {
        workspace_name: name.trim(),
      });
      if (error) throw error;
      await refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Building2 size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Criar seu Workspace</h1>
          <p className="text-muted-foreground text-sm">
            Dê um nome à sua empresa para começar a usar o CRM
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Nome da Empresa</label>
            <input
              type="text"
              required
              className="w-full bg-secondary border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground" />
            ) : (
              'Criar Workspace'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
