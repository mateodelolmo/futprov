// Fase 0.2 del plan de migracion: descarga TODAS las imagenes de tools/import.json
// (hoy en cdn.shopify.com, que moriran cuando Shopify borre la tienda) y las guarda
// en local en tools/rescue/images/{handle}-{n}.{ext}. Reanudable via
// tools/rescue-images.log, igual que tools/download-yupoo-photos.mjs.
//
// Uso: node tools/rescue-images.mjs [--limit N]

import { readFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const OUT_DIR = new URL("./rescue/images/", import.meta.url);
const LOG = new URL("./rescue-images.log", import.meta.url);
const CONCURRENCY = 5;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

await mkdir(OUT_DIR, { recursive: true });

const done = new Set();
if (existsSync(LOG)) {
  const content = await readFile(LOG, "utf8");
  for (const line of content.trim().split("\n")) if (line) done.add(line);
}

const products = JSON.parse(await readFile(new URL("./import.json", import.meta.url), "utf8"));

const jobs = [];
for (const p of products) {
  const images = p.images || [];
  images.forEach((img, i) => {
    if (!img.src) return;
    const ext = (img.src.split("?")[0].split(".").pop() || "jpg").toLowerCase();
    const safeExt = /^(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : "jpg";
    const key = `${p.handle}-${i + 1}.${safeExt}`;
    jobs.push({ key, url: img.src, handle: p.handle });
  });
}

const pending = jobs.filter((j) => !done.has(j.key)).slice(0, LIMIT);
console.log(`Total imagenes: ${jobs.length}. Ya descargadas: ${done.size}. Pendientes: ${pending.length}.`);

let ok = 0;
let failed = 0;
let cursor = 0;

async function downloadOne(job, attempt = 1) {
  try {
    const res = await fetch(job.url, { headers: { "User-Agent": UA } });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const dest = new URL(job.key, OUT_DIR);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
    return true;
  } catch (e) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return downloadOne(job, attempt + 1);
    }
    console.error(`- ${job.key}: ${e.message}`);
    return false;
  }
}

async function worker() {
  while (cursor < pending.length) {
    const job = pending[cursor++];
    const success = await downloadOne(job);
    if (success) {
      ok++;
      await appendFile(LOG, job.key + "\n");
      if (ok % 100 === 0) console.log(`... ${ok}/${pending.length} descargadas`);
    } else {
      failed++;
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\nDescargadas: ${ok}. Fallos: ${failed}. Total en disco (acumulado): ${done.size + ok}.`);
if (failed > 0) console.log("Vuelve a ejecutar el script para reintentar solo las que fallaron.");
