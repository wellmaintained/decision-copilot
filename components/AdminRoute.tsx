import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * Higher-order component that protects admin routes
 * Redirects to /unauthorized if user is not an admin
 */
export function AdminRoute({ 
  children, 
  loadingComponent = <div>Loading...</div> 
}: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect after auth state is determined
    if (!loading && (!user || !isAdmin)) {
      router.push('/unauthorized');
    }
  }, [user, loading, isAdmin, router]);
  
  // Show loading state while checking auth
  if (loading || !user || !isAdmin) {
    return loadingComponent;
  }
  
  // Render children only for admin users
  return <>{children}</>;
} 