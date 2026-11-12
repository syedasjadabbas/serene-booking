// CommonJS on purpose: Node 24 loads tailwind.config.ts as an ES module (no __dirname), which crashed
// the dev server on config reload. Absolute content paths let `next dev client` run from any folder.
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, "app/**/*.{ts,tsx}"), path.join(__dirname, "global/**/*.{ts,tsx}")],
  theme: {
    extend: {
      colors: {
        // Brand green + cream from the Serene Heights logo
        brand: {
          50: "#f1f5f4",
          100: "#dde7e4",
          200: "#bccfca",
          300: "#93b0a9",
          400: "#6a8d85",
          500: "#4f716a",
          600: "#36564f", // logo green
          700: "#2d4842",
          800: "#253a36",
          900: "#1d2e2b",
        },
        cream: { DEFAULT: "#f3f1ec", dark: "#e7e3da" }, // logo cream
        gold: { DEFAULT: "#b8955a", light: "#e9dcc3" },
        // Reference-design accents: lime CTA, deep ink for text/dark panels, soft mist sections.
        lime: { DEFAULT: "#dcf26b", dark: "#cbe352", soft: "#f2fbc8" },
        ink: "#16211f",
        mist: "#eef3f1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(24,24,27,0.04), 0 4px 16px rgba(24,24,27,0.06)",
        pop: "0 12px 40px rgba(24,24,27,0.16)",
      },
    },
  },
  plugins: [],
};
