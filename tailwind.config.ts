import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#080B16",
          900: "#0A0E1E",
          800: "#111633",
          700: "#171D3D",
          600: "#232B54",
        },
        gold: {
          DEFAULT: "#F2C14E",
          soft: "#FBE3A6",
        },
        ember: {
          DEFAULT: "#E23744",
          soft: "#FF6B76",
        },
        mist: {
          DEFAULT: "#F5F7FF",
          muted: "#8A92B2",
          faint: "#4C557C",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "gospel-glow": "radial-gradient(120% 120% at 20% 20%, rgba(242,193,78,0.18) 0%, rgba(242,193,78,0) 60%)",
        "urbain-glow": "radial-gradient(120% 120% at 80% 20%, rgba(226,55,68,0.18) 0%, rgba(226,55,68,0) 60%)",
        "noise": "url('/noise.png')",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "star-drift": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(6deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "star-drift": "star-drift 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
