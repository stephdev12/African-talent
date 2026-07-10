"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeAmount } from "@/lib/types";

export default function VoteWidget({
  candidateId,
  candidateName,
  accent,
}: {
  candidateId: string;
  candidateName: string;
  accent: "gold" | "ember";
}) {
  const [nbVotes, setNbVotes] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = computeAmount(nbVotes);
  const accentBg = accent === "gold" ? "bg-gold text-ink-900 hover:bg-gold-soft" : "bg-ember text-mist hover:bg-ember-soft";
  const accentText = accent === "gold" ? "text-gold" : "text-ember-soft";

  function updateVotes(next: number) {
    setNbVotes(Math.min(5000, Math.max(1, Math.round(next))));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (phone.trim().length < 8) {
      setError("Entre un numéro de téléphone valide pour le paiement.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/votes/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, nbVotes, payerPhone: phone, payerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      window.location.href = data.link;
    } catch (err: any) {
      setError(err.message || "Impossible de démarrer le paiement. Réessaie dans un instant.");
      setLoading(false);
    }
  }

  return (
    <div className="card-surface rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-1">Voter pour</p>
        <h2 className="text-xl font-semibold text-mist">{candidateName}</h2>
      </div>

      {/* Sélecteur de votes, à l'unité */}
      <div>
        <p className="text-sm text-mist-muted mb-3">Nombre de votes</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Réduire le nombre de votes"
            onClick={() => updateVotes(nbVotes - 1)}
            className="w-11 h-11 rounded-full border border-white/10 text-xl text-mist hover:bg-white/5 transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={nbVotes}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="font-mono digit-roll text-3xl font-semibold text-mist"
              >
                {nbVotes.toLocaleString("fr-FR")}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-mist-muted mt-1">{nbVotes > 1 ? "votes" : "vote"}</p>
          </div>
          <button
            type="button"
            aria-label="Augmenter le nombre de votes"
            onClick={() => updateVotes(nbVotes + 1)}
            className="w-11 h-11 rounded-full border border-white/10 text-xl text-mist hover:bg-white/5 transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[1, 5, 10, 20, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => updateVotes(preset)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                nbVotes === preset
                  ? `${accentBg} border-transparent`
                  : "border-white/10 text-mist-muted hover:bg-white/5"
              }`}
            >
              {preset} vote{preset > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="nbVotesInput" className="sr-only">
            Saisir un nombre de votes précis
          </label>
          <input
            id="nbVotesInput"
            type="number"
            min={1}
            max={5000}
            value={nbVotes}
            onChange={(e) => updateVotes(Number(e.target.value))}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-sm text-mist outline-none focus:border-white/25 transition-colors"
            placeholder="Ou saisis un nombre exact de votes"
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between py-4 border-y border-white/[0.06]">
        <span className="text-sm text-mist-muted">Total à payer</span>
        <span className={`font-mono digit-roll text-2xl font-semibold ${accentText}`}>
          {amount.toLocaleString("fr-FR")} FCFA
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="phone" className="text-sm text-mist-muted block mb-1.5">
            Numéro Mobile Money / Orange Money
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="6XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-3 text-mist placeholder:text-mist-faint outline-none focus:border-white/25 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="name" className="text-sm text-mist-muted block mb-1.5">
            Ton nom (optionnel)
          </label>
          <input
            id="name"
            type="text"
            placeholder="Pour figurer parmi les votants"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-3 text-mist placeholder:text-mist-faint outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-ember-soft">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3.5 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${accentBg}`}
        >
          {loading ? "Redirection vers le paiement…" : `Payer ${amount.toLocaleString("fr-FR")} FCFA`}
        </button>
        <p className="text-xs text-mist-faint text-center">
          Paiement sécurisé par Fapshi. Tu seras redirigé(e) vers une page de paiement Mobile Money.
        </p>
      </form>
    </div>
  );
}
