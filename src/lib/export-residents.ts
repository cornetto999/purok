import { exportToExcel } from "./excel";
import { fetchAllRows } from "./fetch-all-rows";
import { supabase } from "./supabase";
import type { Barangay, Household, Member, Purok } from "./types";

/** Read all saved records at export time, including entries from other users. */
export async function exportResidents(): Promise<number> {
  const [barangays, puroks, households, members] = await Promise.all([
    fetchAllRows<Barangay>((from, to) =>
      supabase
        .from("barangays")
        .select("*", from === 0 ? { count: "exact" } : {})
        .order("id")
        .range(from, to),
    ),
    fetchAllRows<Purok>((from, to) =>
      supabase
        .from("puroks")
        .select("*", from === 0 ? { count: "exact" } : {})
        .order("id")
        .range(from, to),
    ),
    fetchAllRows<Household>((from, to) =>
      supabase
        .from("households")
        .select("*", from === 0 ? { count: "exact" } : {})
        .order("id")
        .range(from, to),
    ),
    fetchAllRows<Member>((from, to) =>
      supabase
        .from("members")
        .select("*", from === 0 ? { count: "exact" } : {})
        .order("id")
        .range(from, to),
    ),
  ]);

  // Do not download a partial workbook when any database request fails.
  await exportToExcel({ barangays, puroks, households, members });
  return members.length;
}
