import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { initiatePay } from "@/lib/fapshi";
import { computeAmount } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, nbVotes, payerPhone, payerName } = body as {
      candidateId: string;
      nbVotes: number;
      payerPhone: string;
      payerName?: string;
    };

    if (!candidateId || !Number.isInteger(nbVotes) || nbVotes <= 0) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    if (!payerPhone || payerPhone.trim().length < 8) {
      return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
    }

    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, is_active")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate || !candidate.is_active) {
      return NextResponse.json({ error: "Candidat introuvable." }, { status: 404 });
    }

    const amount = computeAmount(nbVotes);
    const externalId = `vote_${nanoid(12)}`;
    const origin = req.nextUrl.origin;

    // 1. On enregistre la transaction en PENDING avant d'appeler Fapshi
    const { error: insertError } = await supabaseAdmin.from("transactions").insert({
      candidate_id: candidateId,
      external_id: externalId,
      nb_votes: nbVotes,
      amount,
      status: "PENDING",
      payer_phone: payerPhone,
      payer_name: payerName || null,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Impossible d'enregistrer la transaction." }, { status: 500 });
    }

    // 2. On demande à Fapshi un lien de paiement hébergé
    const fapshiRes = await initiatePay({
      amount,
      externalId,
      redirectUrl: `${origin}/merci?ref=${externalId}`,
      message: `${nbVotes} votes pour ${candidate.full_name}`,
    });

    // 3. On complète la transaction avec le transId renvoyé par Fapshi
    await supabaseAdmin
      .from("transactions")
      .update({ trans_id: fapshiRes.transId })
      .eq("external_id", externalId);

    return NextResponse.json({ link: fapshiRes.link });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Une erreur est survenue. Réessaie dans un instant." }, { status: 500 });
  }
}
