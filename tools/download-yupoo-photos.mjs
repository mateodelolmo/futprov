// Descarga las fotos reales de cada álbum de tools/yupoo-missing.json y las guarda en local
// en tools/yupoo-photos/{handle}-1.jpg / -2.jpg (nombre = handle del producto, así luego
// es trivial cruzarlas con el CSV de export de Shopify Files por nombre de archivo).
// Reanudable (tools/yupoo-photos-downloaded.log). Sin token: no toca Shopify para nada.
//
// Uso: node tools/download-yupoo-photos.mjs [--limit N]

import { readFile, appendFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { slugify } from "./lib/product.mjs";

const YUPOO_UID = "1022669895";
const YUPOO_BASE = "https://x.yupoo.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const OUT_DIR = new URL("./yupoo-photos/", import.meta.url);
const LOG = new URL("./yupoo-photos-downloaded.log", import.meta.url);
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

await mkdir(OUT_DIR, { recursive: true });

const done = new Set();
if (existsSync(LOG)) {
  const content = await readFile(LOG, "utf8");
  for (const line of content.trim().split("\n")) if (line) done.add(line);
}

const missing = JSON.parse(await readFile(new URL("./yupoo-missing.json", import.meta.url), "utf8"));
const withHandle = missing.map((m) => ({ ...m, handle: slugify(m.title) }));
const pending = withHandle.filter((m) => !done.has(m.handle)).slice(0, LIMIT);
console.log(`Ya descargados: ${done.size}. Pendientes: ${pending.length} de ${withHandle.length}.`);

async function getAlbumPhotoUrls(albumId) {
  const res = await fetch(`${YUPOO_BASE}/photos/${YUPOO_UID}/albums/${albumId}?uid=1`, {
    headers: { "User-Agent": UA, Referer: `${YUPOO_BASE}/` },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const urls = [];
  const re = /data-src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) && urls.length < 2) urls.push(m[1]);
  return urls;
}

async function downloadImage(url) {
  const fullUrl = url.startsWith("//") ? `https:${url}` : url;
  const res = await fetch(fullUrl, { headers: { "User-Agent": UA, Referer: `${YUPOO_BASE}/` } });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.startsWith("image/")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = contentType.includes("png") ? "png" : "jpg";
  return { buf, ext };
}

let ok = 0;
let noPhotos = 0;
let failed = 0;
let cursor = 0;

async function worker() {
  while (cursor < pending.length) {
    const p = pending[cursor++];
    try {
      const photoUrls = await getAlbumPhotoUrls(p.albumId);
      if (photoUrls.length === 0) {
        noPhotos++;
        await appendFile(LOG, p.handle + "\n");
        continue;
      }
      let saved = 0;
      for (let i = 0; i < photoUrls.length; i++) {
        const image = await downloadImage(photoUrls[i]);
        if (!image) continue;
        await writeFile(new URL(`./${p.handle}-${i + 1}.${image.ext}`, OUT_DIR), image.buf);
        saved++;
      }
      if (saved === 0) {
        noPhotos++;
      } else {
        ok++;
        console.log(`+ ${p.handle} (${saved} foto/s)`);
      }
      await appendFile(LOG, p.handle + "\n");
    } catch (e) {
      failed++;
      console.error(`- ${p.handle}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\nDescargados: ${ok}. Sin fotos: ${noPhotos}. Fallos: ${failed}.`);
