// Compara los álbumes candidatos de Yupoo (tools/yupoo-albums.json) contra el catálogo
// ya publicado en la tienda y escribe qué falta de verdad, en modo conservador:
// ante la duda (equipo/temporada/tipo no reconocidos con confianza), NO se importa.
// Uso: node tools/scrape-yupoo.mjs && node tools/diff-yupoo.mjs

import { readFile, writeFile } from "node:fs/promises";
import { parseAlbumTitle, productKey } from "./parse-yupoo.mjs";

const STORE = "futprov-store.myshopify.com";

async function fetchAllStoreProducts() {
  const all = [];
  for (let page = 1; page <= 15; page++) {
    const res = await fetch(`https://${STORE}/products.json?limit=250&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.products?.length) break;
    all.push(...data.products);
    if (data.products.length < 250) break;
  }
  return all;
}

async function main() {
  const albums = JSON.parse(await readFile(new URL("./yupoo-albums.json", import.meta.url), "utf8"));
  console.log(`Álbumes candidatos de Yupoo: ${albums.length}`);

  const storeProducts = await fetchAllStoreProducts();
  console.log(`Productos en la tienda: ${storeProducts.length}`);

  const existingKeys = new Set();
  let storeParsed = 0;
  for (const p of storeProducts) {
    const parsed = parseAlbumTitle(p.title);
    if (!parsed) continue;
    storeParsed++;
    existingKeys.add(productKey(parsed));
  }
  console.log(`Productos de la tienda reconocidos por el parser: ${storeParsed}`);

  const missing = [];
  const seenInBatch = new Set();
  let unparsed = 0;
  let alreadyExists = 0;
  let dupInBatch = 0;

  for (const album of albums) {
    const parsed = parseAlbumTitle(album.title);
    if (!parsed) {
      unparsed++;
      continue;
    }
    const key = productKey(parsed);
    if (existingKeys.has(key)) {
      alreadyExists++;
      continue;
    }
    if (seenInBatch.has(key)) {
      dupInBatch++;
      continue;
    }
    seenInBatch.add(key);
    missing.push({ albumId: album.id, ...parsed });
  }

  console.log(`Sin reconocer (equipo/temporada/tipo ambiguo, descartados): ${unparsed}`);
  console.log(`Ya existen en la tienda: ${alreadyExists}`);
  console.log(`Duplicados dentro de Yupoo (mismo equipo/temporada/tipo, primero gana): ${dupInBatch}`);
  console.log(`A importar: ${missing.length}`);

  await writeFile(new URL("./yupoo-missing.json", import.meta.url), JSON.stringify(missing));

  const byLeagueSample = missing.slice(0, 300);
  const lines = [
    "# Camisetas de Yupoo pendientes de importar",
    "",
    `Álbumes candidatos: ${albums.length}. Productos en tienda reconocidos: ${storeParsed}. Ya existen: ${alreadyExists}. Sin reconocer: ${unparsed}. **A importar: ${missing.length}**.`,
    "",
    "_Modo conservador: cualquier álbum cuyo equipo, temporada o tipo de equipación no se detectan con confianza se descarta (no se importa). Revisar una muestra antes de lanzar la importación._",
    "",
    "## Muestra (primeros 300)",
    "",
    "| Temporada | Equipo | Tipo | Público | Título ES | Título original Yupoo |",
    "|---|---|---|---|---|---|",
    ...byLeagueSample.map(
      (m) =>
        `| ${m.seasonKey} | ${m.teamKey} | ${m.kitKey} | ${m.audience} | ${m.title} | ${m.rawTitle.replace(/\|/g, "/")} |`
    ),
  ];
  await writeFile(new URL("./yupoo-missing.md", import.meta.url), lines.join("\n") + "\n", "utf8");
  console.log(`Escrito tools/yupoo-missing.json (${missing.length}) y tools/yupoo-missing.md (muestra de ${byLeagueSample.length}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
