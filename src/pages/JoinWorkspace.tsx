import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function JoinWorkspace() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('join_workspace', {
        p_invite_code: code.trim(),
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
            <Users size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Entrar em um Workspace</h1>
          <p className="text-muted-foreground text-sm">
            Digite o código de convite fornecido pelo administrador
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Código de Convite</label>
            <input
              type="text"
              required
              className="w-full bg-secondary border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all font-mono tracking-widest text-center text-lg uppercase"
              placeholder="A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground mx-auto" />
            ) : (
              'Entrar no Workspace'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Quer criar seu próprio workspace?{' '}
          <Link to="/create-workspace" className="text-primary hover:underline">
            Criar workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
