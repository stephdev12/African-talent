import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CandidateWithTotal, CATEGORY_LABELS } from "@/lib/types";
import VoteWidget from "./vote-widget";

export const dynamic = "force-dynamic";

async function getCandidate(slug: string): Promise<CandidateWithTotal | null> {
  const { data, error } = await supabase
    .from("candidates_with_total")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as CandidateWithTotal;
}

export default async function CandidatePage({ params }: { params: { slug: string } }) {
  const candidate = await getCandidate(params.slug);
  if (!candidate) notFound();

  const accent = candidate.category === "gospel" ? "gold" : "ember";
  const glow = accent === "gold" ? "bg-gospel-glow" : "bg-urbain-glow";
  const badge = accent === "gold" ? "bg-gold/10 text-gold" : "bg-ember/10 text-ember-soft";

  return (
    <div className="relative">
      <div className={`absolute inset-x-0 top-0 h-96 ${glow} pointer-events-none`} />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16 grid md:grid-cols-2 gap-10 items-start">
        {/* Colonne portrait */}
        <div className="animate-fade-up flex flex-col gap-5">
          <Link
            href="/"
            className="self-start inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/80 px-4 py-2 text-sm text-mist hover:bg-white/5 hover:border-white/20 transition-colors"
          >
            <span aria-hidden>←</span> Tous les candidats
          </Link>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink-700">
            {candidate.photo_url ? (
              <Image
                src={candidate.photo_url}
                alt={candidate.full_name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-semibold text-mist-faint">
                {candidate.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${badge}`}>
              {CATEGORY_LABELS[candidate.category]}
            </span>
            <h1 className="text-3xl font-semibold text-mist mt-3">{candidate.full_name}</h1>
            {candidate.bio && <p className="text-mist-muted mt-3 leading-relaxed">{candidate.bio}</p>}
            <p className="font-mono digit-roll text-sm text-mist-muted mt-4">
              {candidate.total_votes.toLocaleString("fr-FR")} votes actuellement
            </p>
          </div>
        </div>

        {/* Colonne vote */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <VoteWidget candidateId={candidate.id} candidateName={candidate.full_name} accent={accent} />
        </div>
      </div>
    </div>
  );
}
