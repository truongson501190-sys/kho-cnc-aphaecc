import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPermissions } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
  requiredModule?: keyof UserPermissions;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredModule,
}) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    currentUser: currentUser ? { msnv: currentUser.msnv, role: currentUser.role } : null,
    requiredRole,
    requiredModule,
    path: location.pathname,
  });

  // If not authenticated, redirect to login
  if (!isAuthenticated || !currentUser) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement via hierarchy
  if (requiredRole) {
    const hasRequiredRole = checkRolePermission(currentUser.role, requiredRole);
    if (!hasRequiredRole) {
      console.log('❌ Insufficient role permissions:', {
        userRole: currentUser.role,
        requiredRole,
      });
      return <Navigate to="/" replace />;
    }
  }

  // Check module-based view permission
  if (requiredModule) {
    const canView = !!currentUser.permissions?.[requiredModule]?.view;
    if (!canView) {
      console.log('❌ No module view permission:', {
        requiredModule,
        user: currentUser.msnv,
      });
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};

// Helper function to check role permissions
function checkRolePermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    Admin: ['admin', 'manager', 'user'],
    Duyệt: ['manager', 'user'],
    User: ['user'],
  };

  const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
  return allowedRoles.includes(requiredRole);
}

export default ProtectedRoute;