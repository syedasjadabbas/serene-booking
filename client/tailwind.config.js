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
        // Classic-luxury accents: bronze for eyebrows, stars and fine lines on light backgrounds…
        gold: { DEFAULT: "#ab8965", light: "#e8dccb", dark: "#8a6b4b" },
        // …and champagne for highlights on dark panels (kept under the name "lime" so existing classes keep working).
        lime: { DEFAULT: "#d6c09c", dark: "#c2a77d", soft: "#f1e8da" },
        ivory: "#faf7f2", // page background
        sand: "#efe7da", // warm section background
        // Buttons and solid accents: the dark green of the Serene Heights Group site (its --night section colour)
        pine: { DEFAULT: "#0f241e", hover: "#284840" },
        ink: "#0f1f1b",
        mist: "#f4efe7", // soft warm panels
      },
      fontFamily: {
        // Jost for text (it is also the Serene Heights logo lettering); Marcellus, a classic inscriptional
        // serif, for headings.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-serif)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        logo: ["var(--font-sans)", "sans-serif"],
      },
      // Calmer, more architectural corners than the default scale.
      borderRadius: {
        "2xl": "0.75rem",
        "3xl": "1rem",
        "4xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,33,20,0.04), 0 6px 20px rgba(43,33,20,0.06)",
        pop: "0 18px 50px rgba(43,33,20,0.18)",
      },
    },
  },
  plugins: [],
};
