// src/components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, token } = useAuth();

  console.log('[PROTECTED ROUTE] Checking authentication...');
  console.log('[PROTECTED ROUTE] User:', user);
  console.log('[PROTECTED ROUTE] Token:', token ? token.substring(0, 20) + '...' : 'None');
  console.log('[PROTECTED ROUTE] Loading:', isLoading);

  if (isLoading) {
    console.log('[PROTECTED ROUTE] Still loading, showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !token) {
    console.log('[PROTECTED ROUTE] No user/token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[PROTECTED ROUTE] User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;