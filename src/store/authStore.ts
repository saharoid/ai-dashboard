import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { api } from "../api/client";

export type UserRole = "admin" | "viewer";

interface Me {
  id: string;
  email: string | null;
  role: UserRole;
}

interface AuthState {
  session: Session | null;
  me: Me | null;
  ready: boolean;
  init: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Ask our server who we are; the role comes from the profiles table.
const loadMe = async (session: Session | null): Promise<Me | null> =>
  session ? (await api.get("/me")).data : null;

export const useAuthStore = create<AuthState>()((set) => {
  const apply = async (session: Session | null) => {
    try {
      set({ session, me: await loadMe(session), ready: true });
    } catch (e) {
      console.error(e);
      set({ session, me: null, ready: true });
    }
  };

  return {
    session: null,
    me: null,
    ready: false,

    init: () => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        // Token refresh keeps the same user; no need to reload the role.
        if (event === "TOKEN_REFRESHED") {
          set({ session });
          return;
        }
        // Defer: calling Supabase inside this callback can deadlock.
        setTimeout(() => apply(session), 0);
      });
      return () => data.subscription.unsubscribe();
    },

    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },

    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
});
