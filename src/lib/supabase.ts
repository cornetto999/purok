// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { type Database } from "./types"; // We will create this

import WebSocket from "isomorphic-ws";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your .env file.");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    realtime: {
      transport: WebSocket,
    },
  }
);
