import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Terminal from '@/pages/Terminal';
import Positions from '@/pages/Positions';
import History from '@/pages/History';
import StrategySettings from '@/pages/StrategySettings';
import ResearchBot from '@/pages/ResearchBot';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Terminal />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<StrategySettings />} />
        <Route path="/research" element={<ResearchBot />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(0 0% 6%)',
                border: '1px solid hsl(0 0% 12%)',
                color: 'hsl(120 10% 95%)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
              },
            }}
          />
        </QueryClientProvider>
      </AuthProvider>
    </div>
  )
}

export default App