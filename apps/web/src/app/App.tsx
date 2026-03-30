import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '@/core/auth';
import { setOnRefreshSuccess } from '@/core/api/client';
import { BranchProvider } from '@/core/branch';

function AppContent() {
  const { refreshAuth } = useAuth();
  useEffect(() => {
    setOnRefreshSuccess(() => void refreshAuth());
    return () => setOnRefreshSuccess(null);
  }, [refreshAuth]);
  return (
    <BranchProvider>
      <AppRoutes />
    </BranchProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
