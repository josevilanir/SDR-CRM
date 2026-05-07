import { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { STAGES } from '../components/leads/KanbanBoard';

interface StageCount {
  status: string;
  count: number;
}

interface DashboardStats {
  totalLeads: number;
  totalMessages: number;
  byStage: StageCount[];
}

export function Dashboard() {
  const { workspace } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats>({ totalLeads: 0, totalMessages: 0, byStage: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [leadsRes, messagesRes] = await Promise.all([
          supabase.from('leads').select('status').eq('workspace_id', workspace.id),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
        ]);

        const leads = leadsRes.data ?? [];

        const countMap = leads.reduce<Record<string, number>>((acc, l) => {
          acc[l.status] = (acc[l.status] ?? 0) + 1;
          return acc;
        }, {});

        const byStage: StageCount[] = STAGES.map((stage) => ({
          status: stage,
          count: countMap[stage] ?? 0,
        }));

        setStats({
          totalLeads: leads.length,
          totalMessages: messagesRes.count ?? 0,
          byStage,
        });
      } catch (err) {
        console.error('Dashboard fetchStats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [workspace]);

  const maxStageCount = Math.max(...stats.byStage.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total de Leads"
          value={loading ? null : stats.totalLeads}
          icon={<Users size={20} className="text-primary" />}
        />
        <StatCard
          label="Mensagens Geradas pela IA"
          value={loading ? null : stats.totalMessages}
          icon={<MessageSquare size={20} className="text-primary" />}
        />
        <StatCard
          label="Etapas Ativas"
          value={loading ? null : stats.byStage.filter((s) => s.count > 0).length}
          icon={<TrendingUp size={20} className="text-primary" />}
        />
      </div>

      {/* Leads por etapa */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Leads por Etapa
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {stats.byStage.map(({ status, count }) => (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">{status}</span>
                  <span className="font-semibold text-primary">{count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxStageCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        {value === null ? (
          <div className="h-7 w-16 bg-secondary rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
}
