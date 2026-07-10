import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { candidateId, delta, reason } = await req.json();

  if (!candidateId || typeof delta !== "number" || delta === 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { error: rpcError } = await supabaseAdmin.rpc("increment_manual_votes", {
    p_candidate_id: candidateId,
    p_delta: delta,
  });

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  await supabaseAdmin.from("manual_adjustments").insert({
    candidate_id: candidateId,
    delta,
    reason: reason || null,
  });

  return NextResponse.json({ ok: true });
}
