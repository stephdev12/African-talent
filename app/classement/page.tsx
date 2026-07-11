import { supabaseAdmin } from "@/lib/supabase-admin";
import { CandidateWithTotal } from "@/lib/types";
import LeaderboardClient from "./leaderboard-client";

export const dynamic = "force-dynamic";

async function getCandidates(): Promise<CandidateWithTotal[]> {
  const { data, error } = await supabaseAdmin
    .from("candidates_with_total")
    .select("*")
    .eq("is_active", true);
  if (error) {
    console.error(error);
    return [];
  }
  return data as CandidateWithTotal[];
}

export default async function ClassementPage() {
  const candidates = await getCandidates();
  return <LeaderboardClient initial={candidates} />;
}
