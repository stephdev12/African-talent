import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CandidateWithTotal, CATEGORY_LABELS_SHORT } from "@/lib/types";
import RevealOnScroll from "./components/reveal-on-scroll";

export const dynamic = "force-dynamic";

async function getCandidates(): Promise<CandidateWithTotal[]> {
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("getCandidates error:", error);
    return [];
  }
  console.log("getCandidates returned", data?.length, "candidates");
  return (data || []).map((c) => ({
    ...c,
    total_votes: (c.paid_votes || 0) + (c.manual_votes || 0),
  })) as CandidateWithTotal[];
}

function CandidateCard({ candidate, accent }: { candidate: CandidateWithTotal; accent: "gold" | "ember" }) {
  const ring = accent === "gold" ? "hover:border-gold/40" : "hover:border-ember/40";
  const badge = accent === "gold" ? "bg-gold/10 text-gold" : "bg-ember/10 text-ember-soft";

  return (
    <Link
      href={`/candidat/${candidate.slug}`}
      className={`group card-surface rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ${ring}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-ink-700">
        {candidate.photo_url ? (
          <Image
            src={candidate.photo_url}
            alt={candidate.full_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-mist-faint">
            {candidate.full_name.charAt(0)}
          </div>
        )}
      </div>
      {/* Empilé verticalement (et non côte à côte) pour éviter que le badge et le
          nombre de votes ne se chevauchent quand le nom de catégorie est long */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-mist leading-tight truncate">{candidate.full_name}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${badge}`}>
            {CATEGORY_LABELS_SHORT[candidate.category]}
          </span>
          <span className="text-[11px] text-mist-muted font-mono digit-roll whitespace-nowrap">
            {candidate.total_votes.toLocaleString("fr-FR")} votes
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const candidates = await getCandidates();
  const gospel = candidates.filter((c) => c.category === "gospel");
  const moderne = candidates.filter((c) => c.category === "moderne_urbain");

  return (
    <div>
      {/* HERO — deux ambiances qui se rencontrent au centre, comme deux scènes d'un même concours */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gospel-glow" />
        <div className="absolute inset-0 bg-urbain-glow" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center flex flex-col items-center gap-6 animate-fade-up">
          <div className="relative">
            <Image src="/logo.png" alt="African Talents" width={88} height={88} className="animate-star-drift" />
          </div>
          <p className="eyebrow">Concours musical 2026</p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-mist text-balance">
            Votez pour votre artiste préféré
          </h1>
          <p className="text-mist-muted text-base sm:text-lg max-w-xl text-balance">
            Deux catégories, un seul vainqueur par catégorie. Chaque vote compte.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full sm:w-auto">
            <a
              href="#gospel"
              className="px-5 py-2.5 rounded-full bg-gold text-ink-900 font-medium text-sm text-center whitespace-nowrap hover:bg-gold-soft transition-colors"
            >
              Catégorie Gospel
            </a>
            <a
              href="#moderne"
              className="px-5 py-2.5 rounded-full bg-ember text-mist font-medium text-sm text-center whitespace-nowrap hover:bg-ember-soft transition-colors"
            >
              Catégorie Urbaine
            </a>
            <Link
              href="/classement"
              className="px-5 py-2.5 rounded-full border border-white/10 text-mist font-medium text-sm text-center whitespace-nowrap hover:bg-white/5 transition-colors"
            >
              Voir le classement
            </Link>
          </div>
        </div>
      </section>

      {/* CATÉGORIE GOSPEL */}
      <section id="gospel" className="mx-auto max-w-6xl px-5 sm:px-8 py-16 scroll-mt-20">
        <div className="flex items-baseline justify-between mb-8 gap-3">
          <h2 className="text-2xl font-semibold text-mist flex items-center gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
            <span className="truncate">Gospel</span>
          </h2>
          <span className="text-sm text-mist-muted whitespace-nowrap shrink-0">{gospel.length} candidat(e)s</span>
        </div>
        {gospel.length === 0 ? (
          <p className="text-mist-muted text-sm">Les candidats de cette catégorie seront bientôt annoncés.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {gospel.map((c, i) => (
              <RevealOnScroll key={c.id} delay={(i % 4) * 70}>
                <CandidateCard candidate={c} accent="gold" />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>

      {/* CATÉGORIE MODERNE & URBAIN */}
      <section id="moderne" className="mx-auto max-w-6xl px-5 sm:px-8 py-16 scroll-mt-20">
        <div className="flex items-baseline justify-between mb-8 gap-3">
          <h2 className="text-2xl font-semibold text-mist flex items-center gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full bg-ember shrink-0" />
            <span className="truncate">Urbaine</span>
          </h2>
          <span className="text-sm text-mist-muted whitespace-nowrap shrink-0">{moderne.length} candidat(e)s</span>
        </div>
        {moderne.length === 0 ? (
          <p className="text-mist-muted text-sm">Les candidats de cette catégorie seront bientôt annoncés.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {moderne.map((c, i) => (
              <RevealOnScroll key={c.id} delay={(i % 4) * 70}>
                <CandidateCard candidate={c} accent="ember" />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
