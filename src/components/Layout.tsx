import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads (Kanban)', path: '/leads' },
    { icon: Megaphone, label: 'Campanhas', path: '/campaigns' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "glass-card border-r border-border transition-all duration-300 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl gradient-text">SDR CRM</span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform duration-200",
                location.pathname === item.path ? "scale-110" : "group-hover:scale-110"
              )} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4 space-y-2">
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
