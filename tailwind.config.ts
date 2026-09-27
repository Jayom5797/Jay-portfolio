import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Restrained industrial palette. The 3D models are the visual focus.
        ink: {
          DEFAULT: "#0a0b0d", // near-black base
          900: "#0d0f12",
          800: "#14171b",
          700: "#1c2026",
          600: "#272c33",
        },
        paper: {
          DEFAULT: "#f4f4f2", // warm off-white
          muted: "#e7e7e3",
        },
        steel: {
          50: "#f5f6f7",
          100: "#e3e6e8",
          200: "#c7ccd1",
          300: "#a1a9b1",
          400: "#727c86",
          500: "#4e5760",
          600: "#3b434b",
          700: "#2c333a",
          800: "#1e242a",
          900: "#12161a",
        },
        // A single restrained accent — a technical blueprint blue.
        accent: {
          DEFAULT: "#3b6ea5",
          bright: "#5c8fc7",
          dim: "#2a4d73",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.14em",
      },
      maxWidth: {
        content: "1400px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-slow": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out both",
        "fade-in-slow": "fade-in-slow 1s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
