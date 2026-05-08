import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { Campaigns } from './pages/Campaigns';
import { Login } from './pages/Login';
import { CreateWorkspace } from './pages/CreateWorkspace';
import { JoinWorkspace } from './pages/JoinWorkspace';
import { Team } from './pages/Team';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { workspace, loading: workspaceLoading } = useWorkspace();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(prev => prev?.user?.id === session?.user?.id ? prev : session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading || (session && workspaceLoading)) {
    return <Spinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/" replace />}
      />

      <Route
        path="/create-workspace"
        element={!session ? <Navigate to="/login" replace /> : <CreateWorkspace />}
      />

      <Route
        path="/join"
        element={!session ? <Navigate to="/login" replace /> : <JoinWorkspace />}
      />

      <Route
        element={
          !session ? <Navigate to="/login" replace /> :
          !workspace ? <Navigate to="/create-workspace" replace /> :
          <Layout />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<Kanban />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/team" element={<Team />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </Router>
  );
}

export default App;
