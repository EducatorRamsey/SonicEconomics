import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const assets = resolve(root, "dist/assets");
const js = readdirSync(assets).find((name) => name.endsWith(".js"));
const css = readdirSync(assets).find((name) => name.endsWith(".css"));
if (!js || !css) throw new Error("Run npm run build first.");
const bird =
  "data:image/svg+xml;base64," +
  readFileSync(resolve(root, "public/roadrunner.svg")).toString("base64");
const icon =
  "data:image/svg+xml;base64," +
  readFileSync(resolve(root, "public/favicon.svg")).toString("base64");
const code = readFileSync(resolve(assets, js), "utf8")
  .replaceAll("./roadrunner.svg", bird)
  .replace(/<\/script/gi, "<\\/script");
const style = readFileSync(resolve(assets, css), "utf8");
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#172c31"><link rel="icon" href="${icon}"><title>Roadrunner Rush · Ready to play</title><style>${style}</style></head><body><div id="app"></div><script type="module">${code}</script></body></html>`;
writeFileSync(resolve(root, "dist/Roadrunner-Rush.html"), html);
console.log(
  "Created dist/Roadrunner-Rush.html — open directly in a browser; no server needed.",
);
