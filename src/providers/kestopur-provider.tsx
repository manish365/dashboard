'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { kpFetch } from '@/lib/kestopur/api';
import { secureStorage } from '@/utils/kestopur/secure-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface KpContextType {
  user: User | null;
  permissions: string[];
  roles: string[];
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (perm: string) => boolean;
  hasRole: (role: string) => boolean;
  refresh: () => Promise<void>;
}

const KpContext = createContext<KpContextType | null>(null);

export function KestopurProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = Cookies.get('kp_authToken');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const r = await kpFetch('/profile');
      if (r.success && r.data?.user) {
        const u = r.data.user;
        const userData = { id: u.id, email: u.email, name: u.name || u.email.split('@')[0] };
        setUser(userData);
        setIsAuthenticated(true);
        secureStorage.setItem('userInfo', userData);

        if (u.roles) {
          const userRoles = u.roles.map((r: any) => (typeof r === 'string' ? r : r.name));
          setRoles(userRoles);

          const perms: string[] = [];
          u.roles.forEach((role: any) => {
            if (role.permissions) {
              role.permissions.forEach((p: any) => {
                const pName = typeof p === 'string' ? p : p.name;
                if (!perms.includes(pName)) perms.push(pName);
              });
            }
          });
          setPermissions(perms);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Kp Auth Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = secureStorage.getItem('userInfo');
    if (stored) {
      setUser(stored);
      setIsAuthenticated(true);
    }
    fetchProfile();
  }, [fetchProfile]);

  const hasPermission = useCallback((perm: string) => permissions.includes(perm), [permissions]);
  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);

  return (
    <KpContext.Provider value={{ user, permissions, roles, loading, isAuthenticated, hasPermission, hasRole, refresh: fetchProfile }}>
      {children}
    </KpContext.Provider>
  );
}

export const useKpAuth = () => {
  const ctx = useContext(KpContext);
  if (!ctx) throw new Error('useKpAuth must be used within KestopurProvider');
  return ctx;
};
