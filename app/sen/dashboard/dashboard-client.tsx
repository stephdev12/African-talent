"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateWithTotal, CATEGORY_LABELS } from "@/lib/types";

/* ────────────────────────────────────────────────────────────────── */
/*  Edit Modal                                                       */
/* ────────────────────────────────────────────────────────────────── */

function EditModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: CandidateWithTotal;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(candidate.full_name);
  const [category, setCategory] = useState<"gospel" | "moderne_urbain">(candidate.category);
  const [photoUrl, setPhotoUrl] = useState(candidate.photo_url || "");
  const [bio, setBio] = useState(candidate.bio || "");
  const [foreignPaymentUrl, setForeignPaymentUrl] = useState(candidate.foreign_payment_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          category,
          photo_url: photoUrl.trim() || null,
          bio: bio.trim() || null,
          foreign_payment_url: foreignPaymentUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la sauvegarde.");
      onSaved();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <form
        onSubmit={handleSave}
        className="relative w-full max-w-lg card-surface rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mist">Modifier le candidat</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-mist-muted hover:text-mist hover:bg-white/5 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Nom complet</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "gospel" | "moderne_urbain")}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25 transition-colors"
          >
            <option value="gospel">Gospel</option>
            <option value="moderne_urbain">Urbaine</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-mist-muted block mb-1.5">URL photo</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Bio courte</label>
          <input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25 transition-colors"
          />
        </div>

        {/* Lien de paiement Maketou pour l'étranger */}
        <div className="pt-3 border-t border-white/[0.06]">
          <label className="text-sm text-mist-muted block mb-1.5">
            🌍 Lien de paiement étranger (Maketou)
          </label>
          <input
            type="url"
            value={foreignPaymentUrl}
            onChange={(e) => setForeignPaymentUrl(e.target.value)}
            placeholder="https://maketou.com/pay/…"
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25 transition-colors"
          />
          <p className="text-xs text-mist-faint mt-1.5">
            Colle ici le lien de paiement Maketou créé pour ce candidat. Les votants à l'étranger verront un bouton dédié.
          </p>
        </div>

        {error && <p className="text-sm text-ember-soft">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 font-semibold text-sm border border-white/10 text-mist-muted hover:bg-white/5 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 font-semibold text-sm bg-gold text-ink-900 hover:bg-gold-soft transition-colors disabled:opacity-60"
          >
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Dashboard                                                        */
/* ────────────────────────────────────────────────────────────────── */

export default function DashboardClient() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateWithTotal[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState<"gospel" | "moderne_urbain">("gospel");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [adjusting, setAdjusting] = useState<Record<string, string>>({});

  // Edit modal state
  const [editingCandidate, setEditingCandidate] = useState<CandidateWithTotal | null>(null);

  async function loadCandidates() {
    setLoading(true);
    const res = await fetch("/api/admin/candidates");
    if (res.status === 401) {
      router.push("/sen");
      return;
    }
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, category, photoUrl, bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFullName("");
      setPhotoUrl("");
      setBio("");
      await loadCandidates();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(c: CandidateWithTotal) {
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    loadCandidates();
  }

  async function deleteCandidate(id: string) {
    if (!confirm("Supprimer définitivement ce candidat et ses transactions ?")) return;
    await fetch(`/api/admin/candidates/${id}`, { method: "DELETE" });
    loadCandidates();
  }

  async function adjustVotes(candidateId: string, sign: 1 | -1) {
    const raw = adjusting[candidateId];
    const amount = parseInt(raw, 10);
    if (!amount || amount <= 0) return;
    await fetch("/api/admin/votes/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, delta: sign * amount, reason: "Ajustement manuel admin" }),
    });
    setAdjusting((s) => ({ ...s, [candidateId]: "" }));
    loadCandidates();
  }

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/candidat/${slug}`;
    await navigator.clipboard.writeText(url);
    alert("Lien copié : " + url);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/sen");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold text-mist">Tableau de bord</h1>
        <button onClick={handleLogout} className="text-sm text-mist-muted hover:text-mist transition-colors">
          Déconnexion
        </button>
      </div>

      {/* Ajouter un candidat */}
      <form onSubmit={handleCreate} className="card-surface rounded-2xl p-6 mb-10 grid sm:grid-cols-2 gap-4">
        <h2 className="sm:col-span-2 font-semibold text-mist mb-1">Ajouter un candidat</h2>
        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Nom complet</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25"
          />
        </div>
        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "gospel" | "moderne_urbain")}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25"
          >
            <option value="gospel">Gospel</option>
            <option value="moderne_urbain">Urbaine</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-mist-muted block mb-1.5">URL photo (optionnel)</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25"
          />
        </div>
        <div>
          <label className="text-sm text-mist-muted block mb-1.5">Bio courte (optionnel)</label>
          <input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-2.5 text-mist outline-none focus:border-white/25"
          />
        </div>
        {formError && <p className="sm:col-span-2 text-sm text-ember-soft">{formError}</p>}
        <button
          type="submit"
          disabled={creating}
          className="sm:col-span-2 rounded-xl py-2.5 font-semibold text-sm bg-gold text-ink-900 hover:bg-gold-soft transition-colors disabled:opacity-60"
        >
          {creating ? "Ajout…" : "Ajouter le candidat"}
        </button>
      </form>

      {/* Liste des candidats */}
      {loading ? (
        <p className="text-mist-muted text-sm">Chargement…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {candidates.map((c) => (
            <div key={c.id} className="card-surface rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-mist">
                    {c.full_name}{" "}
                    {!c.is_active && <span className="text-xs text-mist-faint">(désactivé)</span>}
                  </p>
                  <p className="text-xs text-mist-muted">
                    {CATEGORY_LABELS[c.category]} · /candidat/{c.slug}
                  </p>
                  {/* Indicateur lien Maketou */}
                  {c.foreign_payment_url && (
                    <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                      <span>🌍</span> Lien étranger configuré
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono digit-roll text-mist">
                    {c.total_votes.toLocaleString("fr-FR")} votes
                  </span>
                  <span className="text-xs text-mist-faint">
                    ({c.paid_votes} payés + {c.manual_votes} manuels)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                <input
                  type="number"
                  min={1}
                  placeholder="Nombre"
                  value={adjusting[c.id] || ""}
                  onChange={(e) => setAdjusting((s) => ({ ...s, [c.id]: e.target.value }))}
                  className="w-24 rounded-lg bg-ink-700 border border-white/10 px-3 py-1.5 text-sm text-mist outline-none focus:border-white/25"
                />
                <button
                  onClick={() => adjustVotes(c.id, 1)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-mist hover:bg-white/10 transition-colors"
                >
                  + Ajouter
                </button>
                <button
                  onClick={() => adjustVotes(c.id, -1)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-mist hover:bg-white/10 transition-colors"
                >
                  − Retirer
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setEditingCandidate(c)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
                >
                  ✏️ Éditer
                </button>
                <button
                  onClick={() => copyLink(c.slug)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-mist-muted hover:bg-white/5 transition-colors"
                >
                  Copier le lien
                </button>
                <button
                  onClick={() => toggleActive(c)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-mist-muted hover:bg-white/5 transition-colors"
                >
                  {c.is_active ? "Désactiver" : "Réactiver"}
                </button>
                <button
                  onClick={() => deleteCandidate(c.id)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-ember/30 text-ember-soft hover:bg-ember/10 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <p className="text-mist-muted text-sm text-center py-12">Aucun candidat pour le moment.</p>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingCandidate && (
        <EditModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSaved={() => {
            setEditingCandidate(null);
            loadCandidates();
          }}
        />
      )}
    </div>
  );
}
