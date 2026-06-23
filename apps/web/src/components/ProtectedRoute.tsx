import { Navigate } from 'react-router-dom';
import { isSupervisorOrAdmin, getToken } from '../lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken() || !isSupervisorOrAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
