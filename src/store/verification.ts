// 파일 위치: /src/store/verification.ts
import { create } from 'zustand'
import { VerificationStatus } from '@/app/supabase'

interface VerificationStore {
  status: VerificationStatus | null
  email: string | null
  isLoading: boolean
  setStatus: (status: VerificationStatus | null) => void
  setEmail: (email: string | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  status: null,
  email: null,
  isLoading: false,
  setStatus: (status) => set({ status }),
  setEmail: (email) => set({ email }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ status: null, email: null, isLoading: false })
}))