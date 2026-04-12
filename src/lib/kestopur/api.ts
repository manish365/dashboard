// Kestopur API client — calls the kestopur backend at localhost:9000
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_KESTOPUR_API_URL || 'http://localhost:9000';
const CACHE_TTL = 30000; // 30 seconds caching for GET requests

// Simple in-memory cache
const apiCache = new Map<string, { data: any; expiry: number }>();

export function getToken(): string | undefined {
  return Cookies.get('kp_authToken');
}

export function setToken(token: string) {
  Cookies.set('kp_authToken', token, { path: '/' });
}

export function removeToken() {
  Cookies.remove('kp_authToken', { path: '/' });
}

export interface KpFetchOptions extends RequestInit {
  useCache?: boolean;
}

export async function kpFetch(url: string, options: KpFetchOptions = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = `${url}${options.body ? JSON.stringify(options.body) : ''}`;
  
  // Check cache for GET requests
  if (isGet && options.useCache !== false) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
    let result;
    try {
      result = await res.json();
    } catch {
      result = { error: 'Invalid JSON response from server' };
    }

    if (!res.ok) {
      const errorMsg = result.message || result.error || `API Error: ${res.status} ${res.statusText}`;
      if (res.status === 401) removeToken(); // Clear token on unauthorized access
      return { success: false, data: null, status: res.status, error: errorMsg };
    }

    const payload =
      result?.success && result?.data?.data !== undefined
        ? result.data.data
        : result?.success && result?.data !== undefined
          ? result.data
          : result;

    const finalResponse = { success: true, data: payload, status: res.status };

    // Cache the result for GET requests
    if (isGet && options.useCache !== false) {
      apiCache.set(cacheKey, {
        data: finalResponse,
        expiry: Date.now() + CACHE_TTL
      });
    }

    return finalResponse;
  } catch (error: any) {
    console.error('Kestopur API Fetch Error:', error);
    return { success: false, data: null, status: 500, error: error?.message || 'Network error' };
  }
}
