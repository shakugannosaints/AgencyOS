import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase/client'

interface AuthState {
  session: Session | null
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (get().initialized) {
      return
    }

    set({
      loading: true,
      error: null,
    })

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      set({
        session: null,
        user: null,
        initialized: true,
        loading: false,
        error: error.message,
      })
      return
    }

    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
      loading: false,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
        loading: false,
      })
    })
  },

  signIn: async (email, password) => {
    set({
      loading: true,
      error: null,
    })

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      set({
        loading: false,
        error: error.message,
      })
      return false
    }

    set({ loading: false })
    return true
  },

  signUp: async (email, password) => {
    set({
      loading: true,
      error: null,
    })

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      set({
        loading: false,
        error: error.message,
      })
      return false
    }

    set({ loading: false })
    return true
  },

  signOut: async () => {
    set({
      loading: true,
      error: null,
    })

    const { error } = await supabase.auth.signOut()

    if (error) {
      set({
        loading: false,
        error: error.message,
      })
      return
    }

    set({
      session: null,
      user: null,
      loading: false,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))