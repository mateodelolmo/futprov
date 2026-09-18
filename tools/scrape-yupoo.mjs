// Recorre el listado completo de Yupoo (proveedor) y escribe tools/yupoo-albums.json
// con los álbumes candidatos (camisetas de equipo, sin "Player Edition" ni ropa suelta).
// No entra en cada álbum todavía (eso lo hace import-yupoo.mjs, solo para los que se importen).
// Uso: node tools/scrape-yupoo.mjs

import { writeFile } from "node:fs/promises";

const UID = "1022669895";
const BASE = "https://x.yupoo.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const HEADERS = { "User-Agent": UA, Referer: `${BASE}/` };

const PLAYER_RE = /\bplayers?\b|player'?s? edition/i;
const NON_JERSEY_RE =
  /windbreak|down jacket|\bjacket\b|\bcoat\b|tracksuit|training suit|waistcoat|\bvest\b|\bpolo\b|\bpants\b|\bshorts\b|\bscarf\b|\bbag\b|\bsock|\bhat\b|\bcap\b|sweater|hoodie|puffer|north side/i;

function decodeEntities(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchPage(page) {
  const url = `${BASE}/photos/${UID}/albums?tab=gallery&page=${page}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  return res.text();
}

function parseAlbums(html) {
  const albums = [];
  const re = /class="album__main"\s+title="([^"]*)"\s+href="\/photos\/\d+\/albums\/(\d+)/g;
  let m;
  while ((m = re.exec(html))) {
    albums.push({ id: m[2], title: decodeEntities(m[1].trim()) });
  }
  return albums;
}

async function scrapeAllAlbums() {
  const all = [];
  for (let page = 1; page <= 40; page++) {
    const html = await fetchPage(page);
    if (!html) break;
    const albums = parseAlbums(html);
    if (albums.length === 0) break;
    all.push(...albums);
    console.log(`página ${page}: +${albums.length} (total ${all.length})`);
    await new Promise((r) => setTimeout(r, 250));
  }
  return all;
}

async function main() {
  const all = await scrapeAllAlbums();
  console.log(`\nTotal álbumes: ${all.length}`);

  let player = 0;
  let nonJersey = 0;
  const kept = [];
  for (const a of all) {
    if (PLAYER_RE.test(a.title)) {
      player++;
      continue;
    }
    if (NON_JERSEY_RE.test(a.title)) {
      nonJersey++;
      continue;
    }
    kept.push(a);
  }

  console.log(`Descartados Player Edition: ${player}`);
  console.log(`Descartados ropa/no-camiseta: ${nonJersey}`);
  console.log(`Candidatos (camisetas): ${kept.length}`);

  await writeFile(new URL("./yupoo-albums.json", import.meta.url), JSON.stringify(kept));
  console.log(`Escritos ${kept.length} álbumes en tools/yupoo-albums.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
