import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import { useSubscription } from '@/modules/subscription/hooks/use-subscription';
import { Box, Spinner } from '@chakra-ui/react';

/**
 * Wraps clinic app routes. Redirects to /settings/subscription when branch
 * subscription is suspended (except SuperAdmin). Allows access to
 * /settings/subscription and /login without subscription.
 */
export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const { isSuspended, isLoading } = useSubscription();
  const path = location.pathname;

  if (user?.role === 'SuperAdmin') {
    return <>{children}</>;
  }

  if (path === '/settings/subscription') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="40vh">
        <Spinner size="lg" colorScheme="teal" />
      </Box>
    );
  }

  if (isSuspended) {
    return <Navigate to="/settings/subscription" replace />;
  }

  return <>{children}</>;
}
