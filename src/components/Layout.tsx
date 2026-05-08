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
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { cn } from '../utils/cn';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { workspace, workspaces, profile, switchWorkspace } = useWorkspace();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <Building2 className="text-primary" size={20} />
          <span className="font-bold text-lg gradient-text truncate max-w-[150px]">
            {workspace?.name ?? 'SDR CRM'}
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "glass-card border-r border-border transition-all duration-300 z-50 flex flex-col",
          "fixed inset-y-0 left-0 lg:relative",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-border/50 relative">
          <button
            onClick={() => isSidebarOpen && setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all",
              isSidebarOpen ? "hover:bg-secondary" : "justify-center"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="text-primary" size={20} />
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate">{workspace?.name ?? 'SDR CRM'}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Workspace Ativo</p>
                </div>
                <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", showWorkspaceMenu && "rotate-180")} />
              </>
            )}
          </button>

          {/* Workspace Dropdown */}
          {showWorkspaceMenu && isSidebarOpen && (
            <div className="absolute left-4 right-4 top-full mt-2 glass-card border border-border/50 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 max-h-[300px] overflow-y-auto">
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meus Workspaces</p>
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    onClick={async () => {
                      await switchWorkspace(w.id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors",
                      w.id === workspace?.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", w.id === workspace?.id ? "bg-primary" : "bg-muted-foreground/30")} />
                    <span className="truncate">{w.name}</span>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-border/50 bg-secondary/30">
                <Link
                  to="/create-workspace"
                  onClick={() => setShowWorkspaceMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <Plus size={14} /> Novo Workspace
                </Link>
                <Link
                  to="/join"
                  onClick={() => setShowWorkspaceMenu(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <UsersRound size={14} /> Entrar com Código
                </Link>
              </div>
            </div>
          )}
        </div>
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-auto hidden lg:flex"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-auto lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace badge */}
        {workspace && (
          <div className={cn(
            "mx-4 mt-4 p-3 bg-secondary/50 rounded-xl flex items-center gap-3 min-w-0",
            !isSidebarOpen && "lg:justify-center lg:px-2"
          )}>
            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-primary" />
            </div>
            {(isSidebarOpen || (!isSidebarOpen && true)) && (
              <div className={cn("min-w-0", !isSidebarOpen && "lg:hidden")}>
                <p className="text-xs text-muted-foreground leading-none mb-1">Workspace</p>
                <p className="text-sm font-semibold truncate">{workspace.name}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                !isSidebarOpen && "lg:justify-center"
              )}
            >
              <item.icon size={20} className={cn(
                "flex-shrink-0 transition-transform duration-200",
                location.pathname === item.path ? "scale-110" : "group-hover:scale-110"
              )} />
              {(isSidebarOpen || !isSidebarOpen) && (
                <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 space-y-2 mt-auto">
          {isSidebarOpen && profile?.full_name && (
            <p className="text-xs text-muted-foreground px-3 truncate">{profile.full_name}</p>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 p-3 w-full rounded-xl transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              !isSidebarOpen && "lg:justify-center"
            )}
          >
            <LogOut size={20} />
            {(isSidebarOpen || !isSidebarOpen) && (
              <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>Sair</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
