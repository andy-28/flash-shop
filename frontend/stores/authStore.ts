import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, login, register } from "@/lib/api/auth";
import { updateProfile } from "@/lib/api/profile";
import type { AuthUser } from "@/types";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSession: (accessToken: string, user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSession: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
      login: async (email, password) => {
        const response = await login({ email, password });
        get().setSession(response.accessToken, response.user);
      },
      register: async (email, password, name) => {
        const response = await register({ email, password, name });
        get().setSession(response.accessToken, response.user);
      },
      fetchMe: async () => {
        const user = await getMe();
        set({ user, isAuthenticated: true });
      },
      updateProfile: async (data) => {
        const profile = await updateProfile(data);
        const current = get().user;
        set({
          user: current ? {
            ...current,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          } : null,
        });
      },
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "flashshop-auth",
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
