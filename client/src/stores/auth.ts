import { create } from 'zustand'
import type { Role } from '@favour/shared'

interface AuthState {
  userId: string | null
  role: Role | null
  providerId: string | null
  accessToken: string | null
  setSession: (params: { userId: string; role: Role; providerId: string | null; accessToken: string }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  providerId: null,
  accessToken: null,
  setSession: (params) => set(params),
  clear: () => set({ userId: null, role: null, providerId: null, accessToken: null }),
}))
