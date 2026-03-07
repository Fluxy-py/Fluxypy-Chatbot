import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  status: string;
  subscriptionStatus: string;
  plan?: { name: string } | null;
  settings?: any;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, organization: Organization, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, organization, token) => {
    set({ user, organization, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));