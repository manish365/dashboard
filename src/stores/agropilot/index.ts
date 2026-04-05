'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AgroUser { id: string; email: string; name: string; }

interface AuthState {
  user: AgroUser | null;
  token: string | null;
  setAuth: (user: AgroUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAgroAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('agropilot_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('agropilot_token');
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'agropilot-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

interface ChatMsg { role: string; content: string; feedbackId?: string; }
interface ChatState {
  sessionId: string | null;
  messages: ChatMsg[];
  setSessionId: (id: string) => void;
  addMessage: (msg: ChatMsg) => void;
  clearChat: () => void;
}

export const useAgroChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearChat: () => set({ sessionId: null, messages: [] }),
}));
