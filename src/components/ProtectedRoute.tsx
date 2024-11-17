import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthState();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}