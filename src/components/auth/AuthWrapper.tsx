"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/utils/auth";
import { refreshToken, validateToken, getProfile } from "@/services/api/auth";
import { useAppStore } from "@/stores/app-store";
import { assignRole } from "@/lib/roles";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, dispatch } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const publicPaths = ["/login", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {

    if (isPublicPath) {
      if (pathname === "/login") {
        const token = getToken();
        if (token) {
          try {
            const response = await validateToken();
            if (response.status === 200) {
              router.push("/");
              return;
            }
          } catch (error) {
            console.error("Auth check failed:", error);
          }
        }
      } else {
        // Clear token for forgot/reset password to avoid confusion
        removeToken();
      }

      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login?message=Please login to access this page");
      return;
    }
    try {
      const response = await validateToken();
      if (response.status === 200) {
        setIsAuthenticated(true);
        // Sync with global store
        const profileRes = await getProfile();
        if (profileRes.data && profileRes.data.user) {
          const user = profileRes.data.user;
          dispatch({ 
            type: "SET_USER", 
            payload: { ...user, role: assignRole(user.email) } 
          });
          dispatch({ type: "SET_AUTHENTICATED", payload: true });
        }
      } else if (response.status === 401) {
        const tokenRes = await refreshToken();
        if (tokenRes.status === 200) {
          setIsAuthenticated(true);
          // Sync with global store
          const profileRes = await getProfile();
          if (profileRes.data && profileRes.data.user) {
            const user = profileRes.data.user;
            dispatch({ 
              type: "SET_USER", 
              payload: { ...user, role: assignRole(user.email) } 
            });
            dispatch({ type: "SET_AUTHENTICATED", payload: true });
          }
        } else {
          removeToken();
          router.push("/login?message=Session expired. Please login again");
        }
      } else {
        removeToken();
        router.push("/login?message=Authentication failed. Please login again");
      }
    } catch (error) {
      removeToken();
      router.push("/login?message=Authentication failed. Please login again");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
