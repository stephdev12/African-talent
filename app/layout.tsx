import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "African Talents — Votez pour votre artiste",
  description:
    "Concours musical African Talents : votez pour vos candidats préférés dans les catégories Gospel et Urbaine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {/* Place le logo fourni ici : public/logo.png */}
              <Image src="/logo.png" alt="African Talents" width={36} height={36} priority />
              <span className="font-semibold tracking-tight text-mist hidden sm:inline">
                African Talents
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2 text-sm">
              <Link
                href="/"
                className="px-3 py-2 rounded-full text-mist-muted hover:text-mist hover:bg-white/5 transition-colors"
              >
                Candidats
              </Link>
              <Link
                href="/classement"
                className="px-3 py-2 rounded-full text-mist-muted hover:text-mist hover:bg-white/5 transition-colors"
              >
                Classement
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/[0.06] py-8">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist-faint">
            <p>© {new Date().getFullYear()} African Talents. Tous droits réservés.</p>
            <p>Paiement sécurisé par Fapshi · Mobile Money & Orange Money</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
