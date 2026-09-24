import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function test() {
  const { data: mData, error: mErr } = await supabase.from("members").select("id, householdId, purok_id, team_id, code, lastName").order("id", { ascending: false }).limit(5);
  console.log("Members:", mData, mErr);

  const { data: hData, error: hErr } = await supabase.from("households").select("*").order("id", { ascending: false }).limit(5);
  console.log("Households:", hData, hErr);
}

test();
