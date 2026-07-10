"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion.");
      router.push("/sen/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5">
        <div>
          <p className="eyebrow mb-1">Accès organisateur</p>
          <h1 className="text-xl font-semibold text-mist">Tableau de bord</h1>
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-mist-muted block mb-1.5">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-ink-700 border border-white/10 px-4 py-3 text-mist outline-none focus:border-white/25 transition-colors"
          />
        </div>
        {error && <p className="text-sm text-ember-soft">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 font-semibold text-sm bg-gold text-ink-900 hover:bg-gold-soft transition-colors disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
