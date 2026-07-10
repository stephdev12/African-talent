import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Vérifie l'origine de la requête grâce au secret configuré sur le dashboard Fapshi
  const secretHeader = req.headers.get("x-wh-secret");
  const expectedSecret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (expectedSecret && secretHeader !== expectedSecret) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const payload = await req.json();
  const { transId, externalId, status } = payload as {
    transId?: string;
    externalId?: string;
    status?: string;
  };

  if (!externalId && !transId) {
    return NextResponse.json({ error: "Payload incomplet." }, { status: 400 });
  }

  const query = supabaseAdmin.from("transactions").select("*");
  const { data: transaction, error } = externalId
    ? await query.eq("external_id", externalId).single()
    : await query.eq("trans_id", transId!).single();

  if (error || !transaction) {
    console.error("Webhook Fapshi: transaction introuvable", externalId, transId);
    // On répond 200 quand même pour éviter que Fapshi ne réessaie indéfiniment
    // une transaction qu'on ne reconnaît pas.
    return NextResponse.json({ ok: true });
  }

  // Idempotence : si on a déjà traité cette transaction comme SUCCESSFUL, on ne recrédite pas les votes
  if (transaction.status === "SUCCESSFUL") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const newStatus = status || "FAILED";

  await supabaseAdmin
    .from("transactions")
    .update({
      status: newStatus,
      trans_id: transId || transaction.trans_id,
      confirmed_at: newStatus === "SUCCESSFUL" ? new Date().toISOString() : null,
    })
    .eq("id", transaction.id);

  if (newStatus === "SUCCESSFUL") {
    const { error: rpcError } = await supabaseAdmin.rpc("increment_paid_votes", {
      p_candidate_id: transaction.candidate_id,
      p_delta: transaction.nb_votes,
    });
    if (rpcError) {
      console.error("Erreur lors du crédit des votes:", rpcError);
      return NextResponse.json({ error: "Erreur lors du crédit des votes." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
