import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0D0D0D",
          soft: "#1A1A2E",
        },
        acid: {
          DEFAULT: "#C8F135",
          dim: "#A8D120",
        },
        plasma: {
          DEFAULT: "#7B2FFF",
          light: "#9D5FFF",
        },
        ghost: {
          DEFAULT: "#F5F0E8",
          dim: "#E8E0D0",
        },
        ember: "#FF4D4D",
        ice: "#4DFFEE",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-acid": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200,241,53,0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(200,241,53,0)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.5s ease forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "pulse-acid": "pulse-acid 2s infinite",
        "ticker": "ticker 20s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
