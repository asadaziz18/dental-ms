import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import type { UserRole } from '@dental-ms/shared-types';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
}

/**
 * Renders children only if the current user has one of the allowed roles.
 * Use inside a route that is already protected by ProtectedRoute.
 */
export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
