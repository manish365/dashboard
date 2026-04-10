"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "../utils/auth";
import { refreshToken, validateToken } from "../services/api/auth";
export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);
  const checkAuth = async () => {
    const publicPaths = ["/wp-admin/login", "/wp-admin/forgot-password", "/wp-admin/reset-password"];
    const isPublicPath = publicPaths.includes(pathname);

    // auth checks are intentionally minimal here; customize after merge
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

  if (isAuthenticated && pathname !== "/wp-admin/login") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
}
