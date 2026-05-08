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
  conversionRate: number;
  recentLogs: any[];
}

export function Dashboard() {
  const { workspace } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats>({ 
    totalLeads: 0, 
    totalMessages: 0, 
    byStage: [], 
    conversionRate: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [leadsRes, messagesRes, logsRes] = await Promise.all([
          supabase.from('leads').select('status').eq('workspace_id', workspace.id),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
          supabase.from('activity_logs')
            .select('*, leads(name)')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const leads = leadsRes.data ?? [];
        const finalStageCount = leads.filter(l => l.status === 'Reunião Agendada').length;
        const convRate = leads.length > 0 ? (finalStageCount / leads.length) * 100 : 0;

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
          conversionRate: convRate,
          recentLogs: logsRes.data ?? []
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
          label="Mensagens via IA"
          value={loading ? null : stats.totalMessages}
          icon={<MessageSquare size={20} className="text-primary" />}
        />
        <StatCard
          label="Taxa de Conversão"
          value={loading ? null : stats.conversionRate}
          isPercentage
          icon={<TrendingUp size={20} className="text-primary" />}
        />
      </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Atividade Recente */}
        <div className="glass-card p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Atividade Recente
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : stats.recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 italic">
              Nenhuma atividade recente encontrada.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-bold text-primary">{log.leads?.name}</span>
                      {' '}
                      {log.action === 'move' ? (
                        <>foi movido para <span className="font-medium text-foreground">{log.details.to}</span></>
                      ) : log.action === 'create' ? (
                        'foi criado'
                      ) : log.action === 'message_gen' ? (
                        'teve mensagens geradas via IA'
                      ) : log.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  isPercentage 
}: { 
  label: string; 
  value: number | null; 
  icon: React.ReactNode;
  isPercentage?: boolean;
}) {
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
          <p className="text-2xl font-bold">
            {isPercentage ? `${value.toFixed(1)}%` : value}
          </p>
        )}
      </div>
    </div>
  );
}
