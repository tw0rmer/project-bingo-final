import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    } else if (!loading && user && requireAdmin && !user.isAdmin) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation, requireAdmin]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting (don't render children until redirect is complete)
  if (!user || (requireAdmin && !user.isAdmin)) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}