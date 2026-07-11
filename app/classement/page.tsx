import { supabaseAdmin } from "@/lib/supabase-admin";
import { CandidateWithTotal } from "@/lib/types";
import LeaderboardClient from "./leaderboard-client";

export const dynamic = "force-dynamic";

async function getCandidates(): Promise<CandidateWithTotal[]> {
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("is_active", true);
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).map((c) => ({
    ...c,
    total_votes: (c.paid_votes || 0) + (c.manual_votes || 0),
  })) as CandidateWithTotal[];
}

export default async function ClassementPage() {
  const candidates = await getCandidates();
  return <LeaderboardClient initial={candidates} />;
}
