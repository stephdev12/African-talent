"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CandidateWithTotal, CATEGORY_LABELS, CandidateCategory } from "@/lib/types";

type Tab = "all" | CandidateCategory;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Classement général" },
  { key: "gospel", label: "Gospel" },
  { key: "moderne_urbain", label: "Moderne & Urbain" },
];

const REFRESH_MS = 15000;

export default function LeaderboardClient({ initial }: { initial: CandidateWithTotal[] }) {
  const [candidates, setCandidates] = useState<CandidateWithTotal[]>(initial);
  const [tab, setTab] = useState<Tab>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("candidates_with_total")
        .select("*")
        .eq("is_active", true);
      if (data) {
        setCandidates(data as CandidateWithTotal[]);
        setLastUpdated(new Date());
      }
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const ranked = useMemo(() => {
    const filtered = tab === "all" ? candidates : candidates.filter((c) => c.category === tab);
    return [...filtered].sort((a, b) => b.total_votes - a.total_votes);
  }, [candidates, tab]);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-mist">Classement</h1>
        <p className="text-sm text-mist-faint">
          Mis à jour automatiquement · dernière actualisation {lastUpdated.toLocaleTimeString("fr-FR")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              tab === t.key ? "bg-mist text-ink-900 font-medium" : "border border-white/10 text-mist-muted hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <LayoutGroup>
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {ranked.map((c, i) => (
              <motion.div
                layout
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`card-surface rounded-2xl p-4 flex items-center gap-4 ${
                  i === 0 ? "border-gold/30" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-mono text-sm font-semibold ${
                    i === 0 ? "bg-gold text-ink-900" : i === 1 ? "bg-mist/20 text-mist" : i === 2 ? "bg-ember/20 text-ember-soft" : "bg-white/5 text-mist-muted"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mist truncate">{c.full_name}</p>
                  {tab === "all" && (
                    <p className="text-xs text-mist-muted">{CATEGORY_LABELS[c.category]}</p>
                  )}
                </div>
                <motion.p
                  key={c.total_votes}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono digit-roll text-lg font-semibold text-mist shrink-0"
                >
                  {c.total_votes.toLocaleString("fr-FR")}
                </motion.p>
              </motion.div>
            ))}
          </AnimatePresence>
          {ranked.length === 0 && (
            <p className="text-mist-muted text-sm text-center py-12">Aucun candidat pour le moment.</p>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
}
