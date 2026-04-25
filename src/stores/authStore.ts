import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  displayName: string;
  role?: string;
  tenantId?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('admin_token'),
  user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  setAuth: (token, user) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,
}));
