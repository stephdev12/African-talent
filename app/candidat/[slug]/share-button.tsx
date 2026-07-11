"use client";

import { useState, useEffect } from "react";

interface ShareButtonProps {
  candidateName: string;
}

export default function ShareButton({ candidateName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `African Talents - ${candidateName}`,
      text: `Votez pour ${candidateName} au concours musical African Talents 2026 !`,
      url: window.location.href,
    };

    if (canShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // If user cancelled, don't do anything
        if ((err as Error).name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/80 px-4 py-2 text-sm text-mist hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 duration-150"
      aria-label={canShare ? "Partager le lien du candidat" : "Copier le lien du candidat"}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-gold"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-gold font-medium">Lien copié !</span>
        </>
      ) : (
        <>
          {canShare ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-mist-muted"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Partager</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-mist-muted"
              >
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.078a2.75 2.75 0 0 0-2.75-2.75H8.5V3.5Z" />
                <path d="M11.25 9.75H4.75A1.75 1.75 0 0 0 3 11.5v5c0 .966.784 1.75 1.75 1.75h6.5A1.75 1.75 0 0 0 13 16.5v-5a1.75 1.75 0 0 0-1.75-1.75Z" />
              </svg>
              <span>Copier le lien</span>
            </>
          )}
        </>
      )}
    </button>
  );
}
