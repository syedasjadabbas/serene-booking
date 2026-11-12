// Vercel build for the API project: generate the Prisma client, then emit a minimal static
// output directory. Vercel requires one after a build; everything else is rewritten to the
// Express function (see vercel.json), so it only holds a robots.txt that keeps crawlers out.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

execFileSync(process.execPath, [path.join(__dirname, "node_modules/prisma/build/index.js"), "generate"], { stdio: "inherit" });

const out = path.join(__dirname, "public");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log("vercel-build: prisma client generated, public/robots.txt written");
