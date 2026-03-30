import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import type { UserRole } from '@dental-ms/shared-types';
import { Box, Spinner } from '@chakra-ui/react';

interface ProtectedRouteProps {
  /** If set, user must have one of these roles to access. */
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps = {}) {
  const { user, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
        <Spinner size="xl" colorScheme="teal" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
