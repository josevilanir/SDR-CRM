import { useState } from 'react';
import { Users, Plus, Copy, Trash2, Check, Crown } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useMembers } from '../hooks/useMembers';

export function Team() {
  const { profile, updateProfile } = useWorkspace();
  const { members, invites, loading, fetchMembers, generateInvite, revokeInvite } = useMembers();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [isEditingOwnName, setIsEditingOwnName] = useState(false);
  const [tempName, setTempName] = useState('');

  const isAdmin = profile?.role === 'admin';

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    try {
      await updateProfile({ full_name: tempName.trim() });
      await fetchMembers();
      setIsEditingOwnName(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateInvite = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateInvite();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeInvite(id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-1">Equipe</h1>
        <p className="text-muted-foreground">Gerencie os membros do seu workspace</p>
      </div>

      {/* Members list */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold">
            Membros {!loading && `(${members.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum membro encontrado.
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {(member.full_name ?? member.email ?? '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    {member.id === profile?.id ? (
                      <div className="flex items-center gap-2 group">
                        {isEditingOwnName ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              className="bg-background border border-primary/50 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-40"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') setIsEditingOwnName(false);
                              }}
                            />
                            <button
                              onClick={handleSaveName}
                              className="p-1 hover:bg-primary/20 rounded text-primary transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setIsEditingOwnName(false)}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground transition-colors"
                            >
                              <Plus size={14} className="rotate-45" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium truncate flex items-center gap-2">
                              {member.full_name ?? 'Sem nome'}
                              <span className="text-xs text-muted-foreground font-normal">(você)</span>
                            </p>
                            <button
                              onClick={() => {
                                setTempName(member.full_name ?? '');
                                setIsEditingOwnName(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-all"
                              title="Editar nome"
                            >
                              <Plus size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium truncate">
                        {member.full_name ?? 'Sem nome'}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {member.email ?? '—'}
                    </p>
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    member.role === 'admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {member.role === 'admin' && <Crown size={11} />}
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite codes — admin only */}
      {isAdmin && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Convites</h2>
                <p className="text-xs text-muted-foreground">Válidos por 7 dias</p>
              </div>
            </div>
            <button
              onClick={handleGenerateInvite}
              disabled={generating}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary-foreground" />
              ) : (
                <Plus size={16} />
              )}
              Gerar código
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum convite ativo. Gere um código para convidar membros.
            </p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl"
                >
                  <div>
                    <p className="font-mono font-bold tracking-widest text-primary text-lg">
                      {invite.code}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expira em{' '}
                      {new Date(invite.expires_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(invite.code)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="Copiar código"
                    >
                      {copiedCode === invite.code ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevoke(invite.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      title="Revogar convite"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
