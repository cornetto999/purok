import { createClient } from "@supabase/supabase-js";
import { type Database } from "./types"; // We will create this

const env = import.meta.env as any;
const supabaseUrl = env.VITE_SUPABASE_URL || (process.env as any).NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || (process.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your .env file.");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);
