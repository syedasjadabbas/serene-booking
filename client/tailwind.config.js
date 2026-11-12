// CommonJS on purpose: Node 24 loads tailwind.config.ts as an ES module (no __dirname), which crashed
// the dev server on config reload. Absolute content paths let `next dev client` run from any folder.
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, "app/**/*.{ts,tsx}"), path.join(__dirname, "global/**/*.{ts,tsx}")],
  theme: {
    extend: {
      colors: {
        // Greens shared with the Serene Heights Group site (pine #18332a, brand #37584f, sage #a9c7b8,
        // mist #dfece4) so /booking feels like part of the group.
        brand: {
          50: "#f1f6f3",
          100: "#dfece4", // group mist
          200: "#c4d9cf",
          300: "#a9c7b8", // group sage
          400: "#7fa797",
          500: "#5d8576",
          600: "#37584f", // group brand green (logo)
          700: "#284840",
          800: "#18332a", // group pine
          900: "#0f241e", // group night
        },
        cream: { DEFAULT: "#f3f1ec", dark: "#e7e3da" }, // logo cream
        gold: { DEFAULT: "#b8955a", light: "#e9dcc3" },
        // Soft accent (kept under the name "lime" so existing classes keep working): the group's sage green
        // for highlights on dark panels; deep ink for text/dark panels; soft mist sections.
        lime: { DEFAULT: "#a9c7b8", dark: "#93b8a6", soft: "#dfece4" },
        // Buttons and solid accents: the dark green of the Serene Heights Group site (its --night section colour)
        pine: { DEFAULT: "#0f241e", hover: "#284840" },
        ink: "#0f1f1b",
        mist: "#ecf2ee",
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
