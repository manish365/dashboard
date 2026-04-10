'use client';

import { useKpAuth } from '@/providers/kestopur-provider';

/**
 * Custom hook for permission checking in Kestopur module
 * Provides convenient methods for permission-based UI rendering
 */
export const usePermissions = () => {
  const { permissions, roles, hasPermission, hasRole } = useKpAuth();

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    // Helper to check if user is admin
    isAdmin: () => hasRole('admin') || hasRole('super_admin'),
    // Legacy support aliases
    can: (permission: string) => hasPermission(permission),
    cannot: (permission: string) => !hasPermission(permission),
  };
};

export default usePermissions;
