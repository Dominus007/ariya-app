import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the initial getSession() call resolves. */
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  /** Returns an error message on failure, or null on success. Session updates
   * arrive via onAuthStateChange (see initialize), not this return value. */
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  /** Returns { error, needsEmailConfirmation }. Supabase projects default to
   * requiring email confirmation, in which case no session is issued yet. */
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  /** Call once from the app root to hydrate session + subscribe to auth changes. */
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signUpWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message, needsEmailConfirmation: false };
    return { error: null, needsEmailConfirmation: !data.session };
  },

  // Clears the Supabase session; RootNavigator reacts to `session` becoming
  // null by swapping to the signed-out stack (Landing first), so no
  // explicit navigation call is needed here.
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
      set({ isLoading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });

    return () => subscription.unsubscribe();
  },
}));
