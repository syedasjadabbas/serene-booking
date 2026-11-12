import path from "node:path";
import { fileURLToPath } from "node:url";

// Absolute config path so Tailwind works whatever directory `next` is started from.
const dir = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: path.join(dir, "tailwind.config.ts") },
    autoprefixer: {},
  },
};
