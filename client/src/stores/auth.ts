import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@favour/shared'

interface AuthState {
  userId: string | null
  role: Role | null
  providerId: string | null
  accessToken: string | null
  hasHydrated: boolean
  setSession: (params: { userId: string; role: Role; providerId: string | null; accessToken: string }) => void
  setHydrated: () => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      providerId: null,
      accessToken: null,
      hasHydrated: false,
      setSession: (params) => set({ ...params }),
      setHydrated: () => set({ hasHydrated: true }),
      clear: () =>
        set({
          userId: null,
          role: null,
          providerId: null,
          accessToken: null,
        }),
    }),
    {
      name: 'favour-auth',
      partialize: ({ userId, role, providerId, accessToken }) => ({
        userId,
        role,
        providerId,
        accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
