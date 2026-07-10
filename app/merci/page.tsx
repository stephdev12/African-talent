import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPaymentStatus } from "@/lib/fapshi";

export const dynamic = "force-dynamic";

async function resolveTransaction(ref: string) {
  const { data: transaction } = await supabaseAdmin
    .from("transactions")
    .select("*, candidates(full_name, slug)")
    .eq("external_id", ref)
    .single();

  if (!transaction) return null;

  // Si le webhook n'est pas encore passé, on vérifie directement auprès de Fapshi
  if (transaction.status === "PENDING" && transaction.trans_id) {
    try {
      const status = await getPaymentStatus(transaction.trans_id);
      if (status.status === "SUCCESSFUL" && transaction.status !== "SUCCESSFUL") {
        await supabaseAdmin
          .from("transactions")
          .update({ status: "SUCCESSFUL", confirmed_at: new Date().toISOString() })
          .eq("id", transaction.id);
        await supabaseAdmin.rpc("increment_paid_votes", {
          p_candidate_id: transaction.candidate_id,
          p_delta: transaction.nb_votes,
        });
        transaction.status = "SUCCESSFUL";
      } else if (status.status === "FAILED" || status.status === "EXPIRED") {
        await supabaseAdmin.from("transactions").update({ status: status.status }).eq("id", transaction.id);
        transaction.status = status.status;
      }
    } catch {
      // silencieux : on affiche l'état "en attente" par défaut
    }
  }

  return transaction;
}

export default async function MerciPage({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref;
  const transaction = ref ? await resolveTransaction(ref) : null;

  if (!transaction) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-mist mb-3">Référence introuvable</h1>
        <p className="text-mist-muted mb-8">
          Nous n'avons pas retrouvé cette transaction. Si le montant a été débité, contacte l'organisateur.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/80 px-5 py-2.5 text-sm text-mist hover:bg-white/5 hover:border-white/20 transition-colors"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  const candidateName = (transaction as any).candidates?.full_name ?? "";
  const candidateSlug = (transaction as any).candidates?.slug ?? "";

  const statusConfig: Record<string, { title: string; text: string; color: string }> = {
    SUCCESSFUL: {
      title: "Paiement confirmé 🎉",
      text: `${transaction.nb_votes} votes ont été ajoutés pour ${candidateName}.`,
      color: "text-gold",
    },
    PENDING: {
      title: "Paiement en cours de traitement",
      text: "Ton paiement est en cours de confirmation. Cette page se mettra à jour automatiquement ; tu peux aussi rafraîchir dans quelques secondes.",
      color: "text-mist-muted",
    },
    FAILED: {
      title: "Paiement échoué",
      text: "Le paiement n'a pas abouti. Aucun vote n'a été débité. Tu peux réessayer.",
      color: "text-ember-soft",
    },
    EXPIRED: {
      title: "Lien de paiement expiré",
      text: "Le délai pour payer est dépassé. Aucun vote n'a été débité. Tu peux réessayer.",
      color: "text-ember-soft",
    },
  };

  const config = statusConfig[transaction.status] ?? statusConfig.PENDING;

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center animate-fade-up">
      <h1 className={`text-3xl font-semibold mb-4 ${config.color}`}>{config.title}</h1>
      <p className="text-mist-muted mb-10 leading-relaxed">{config.text}</p>
      <div className="flex items-center justify-center gap-3">
        {candidateSlug && (
          <Link
            href={`/candidat/${candidateSlug}`}
            className="px-5 py-2.5 rounded-full bg-gold text-ink-900 font-medium text-sm hover:bg-gold-soft transition-colors"
          >
            Revoter pour {candidateName}
          </Link>
        )}
        <Link
          href="/classement"
          className="px-5 py-2.5 rounded-full border border-white/10 text-mist font-medium text-sm hover:bg-white/5 transition-colors"
        >
          Voir le classement
        </Link>
      </div>
    </div>
  );
}
