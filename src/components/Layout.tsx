import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  LogOut,
  Menu,
  X,
  Building2,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { cn } from '../utils/cn';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { workspace, profile } = useWorkspace();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads (Kanban)', path: '/leads' },
    { icon: Megaphone, label: 'Campanhas', path: '/campaigns' },
    { icon: UsersRound, label: 'Equipe', path: '/team' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "glass-card border-r border-border transition-all duration-300 z-50 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          {isSidebarOpen && <span className="font-bold text-xl gradient-text">SDR CRM</span>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-auto"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Workspace badge */}
        {workspace && (
          <div className={cn(
            "mx-4 mt-4 p-3 bg-secondary/50 rounded-xl flex items-center gap-3 min-w-0",
            !isSidebarOpen && "justify-center px-2"
          )}>
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-primary" />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none mb-1">Workspace</p>
                <p className="text-sm font-semibold truncate">{workspace.name}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="mt-4 px-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                !isSidebarOpen && "justify-center"
              )}
            >
              <item.icon size={20} className={cn(
                "flex-shrink-0 transition-transform duration-200",
                location.pathname === item.path ? "scale-110" : "group-hover:scale-110"
              )} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 space-y-2">
          {isSidebarOpen && profile?.full_name && (
            <p className="text-xs text-muted-foreground px-3 truncate">{profile.full_name}</p>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 p-3 w-full rounded-xl transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
