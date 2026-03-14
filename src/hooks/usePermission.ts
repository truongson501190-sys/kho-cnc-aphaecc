import { useAuth } from '@/hooks/useAuth';
import type { UserPermissions, ModulePermission } from '@/types/user';

/**
 * usePermission: tiện ích kiểm tra quyền theo module & hành động.
 * - module: một key trong UserPermissions (vd: 'kho-tong', ...)
 * - action: một key trong ModulePermission (view, add, edit, delete, approve, export)
 */
export function usePermission() {
  const { currentUser } = useAuth();

  const can = (module: keyof UserPermissions, action: keyof ModulePermission): boolean => {
    const perms = currentUser?.permissions?.[module];
    return !!perms && !!perms[action];
  };

  const canView = (module: keyof UserPermissions): boolean => {
    return !!currentUser?.permissions?.[module]?.view;
  };

  return { can, canView };
}