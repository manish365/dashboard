const BASE = process.env.NEXT_PUBLIC_LEARNPATH_API_URL || 'http://localhost:8000';

export async function lpFetch(path: string, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lp_token') : null;
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

export type Role = 'ADMIN' | 'LEARNER';
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LPUser { id: string; name: string; email: string; role: Role; createdAt: string; _count: { enrollments: number }; }
export interface Todo { id: string; label: string; order: number; stepId: string; }
export interface Step { id: string; title: string; description: string; resources: string[]; estimatedHours: number; order: number; roadmapId: string; todos: Todo[]; }
export interface Roadmap { id: string; title: string; description: string; category: string; level: Level; tags: string[]; published: boolean; createdAt: string; updatedAt: string; createdById: string; createdBy?: { name: string; email: string }; steps: Step[]; _count?: { enrollments: number }; }
export interface TodoProgress { id: string; enrollmentId: string; todoId: string; completed: boolean; completedAt?: string | null; }
export interface Enrollment { id: string; userId: string; roadmapId: string; enrolledAt: string; googleDocUrl?: string | null; progress: TodoProgress[]; roadmap?: Roadmap; }
