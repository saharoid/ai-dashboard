import { createClient } from "@supabase/supabase-js";

// Public anon key: safe in the browser. Used only for sign-in.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
