import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Agora você pode entrar.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">SDR CRM</h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta agora'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium block mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full bg-secondary border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-secondary border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-secondary border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 gap-2 mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground" />
            ) : isLogin ? (
              <><LogIn size={20} /> Entrar</>
            ) : (
              <><UserPlus size={20} /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
          </button>
        </div>
      </div>
    </div>
  );
}
