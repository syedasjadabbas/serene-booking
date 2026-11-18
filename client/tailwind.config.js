// CommonJS on purpose: Node 24 loads tailwind.config.ts as an ES module (no __dirname), which crashed
// the dev server on config reload. Absolute content paths let `next dev client` run from any folder.
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, "app/**/*.{ts,tsx}"), path.join(__dirname, "global/**/*.{ts,tsx}")],
  theme: {
    extend: {
      colors: {
        // Greens shared with the Serene Heights Group site; used for focus rings, badges and the dark panels.
        brand: {
          50: "#f1f6f3",
          100: "#dfece4",
          200: "#c4d9cf",
          300: "#a9c7b8",
          400: "#7fa797",
          500: "#5d8576",
          600: "#37584f",
          700: "#284840",
          800: "#18332a",
          900: "#0f241e",
        },
        // Editorial palette: deep navy ink on bone paper, a pale mountain-sky blue for feature sections,
        // and pine for the darkest panels (menu, footer).
        ink: "#17233B",
        bone: "#F3F3EC",
        sky: { DEFAULT: "#B5CEDB", light: "#DAE7EE", dark: "#8EAFC2" },
        pine: { DEFAULT: "#0f241e", hover: "#1d3a31" },
        cream: { DEFAULT: "#f3f1ec", dark: "#e7e3da" },
        // Accent for small details on light backgrounds (kept under "gold" so existing classes keep working)…
        gold: { DEFAULT: "#4F6F84", light: "#DAE7EE", dark: "#17233B" },
        // …and for highlights on dark backgrounds (kept under "lime").
        lime: { DEFAULT: "#B5CEDB", dark: "#8EAFC2", soft: "#DAE7EE" },
        ivory: "#F3F3EC",
        sand: "#E8E8DF",
        mist: "#EBEBE3",
      },
      fontFamily: {
        // Manrope for text and small-caps labels; Playfair Display for headlines and (italic) accent words.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-serif)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        script: ["var(--font-serif)", "Georgia", "serif"],
        logo: ["var(--font-sans)", "sans-serif"],
      },
      // Architectural, nearly square corners.
      borderRadius: {
        xl: "0.375rem",
        "2xl": "0.375rem",
        "3xl": "0.5rem",
        "4xl": "0.625rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,35,59,0.05), 0 6px 20px rgba(23,35,59,0.06)",
        pop: "0 20px 50px rgba(23,35,59,0.18)",
      },
    },
  },
  plugins: [],
};
