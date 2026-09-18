// Scrapea TODO el catálogo de camisfutbol.shop (2.586 productos) y genera
// tools/import.json listo para la Admin API: opciones Talla×Parche, variantes con precio.
// Ejecutar una vez: node tools/build-import.mjs

import { writeFile } from "node:fs/promises";
import {
  ADULT_SIZES,
  KID_SIZES,
  slugify,
  isKid,
  deriveLeague,
  deriveSeason,
  deriveKind,
  buildOptions,
  buildVariants,
} from "./lib/product.mjs";

const SOURCE = "https://camisfutbol.shop";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

async function scrapeAll() {
  const all = [];
  for (let p = 1; p <= 12; p++) {
    const r = await fetch(`${SOURCE}/products.json?limit=250&page=${p}`, { headers: { "User-Agent": UA } });
    if (!r.ok) break;
    const d = await r.json();
    if (!d.products.length) break;
    all.push(...d.products);
    console.log(`página ${p}: +${d.products.length} (total ${all.length})`);
  }
  return all;
}

function buildProduct(p) {
  const title = p.title.trim();
  const kid = isKid(title);
  const sizes = kid ? KID_SIZES : ADULT_SIZES;
  const league = deriveLeague(p.tags, title);
  const season = deriveSeason(p.tags, title);
  const kind = deriveKind(p.tags, title);

  const hasVersion = kind === "Camiseta" || kind === "Camiseta Retro";

  const options = buildOptions(sizes, hasVersion);
  const variants = buildVariants(sizes, hasVersion);

  const tags = new Set([
    league,
    season,
    kind,
    ...(p.tags || []).map((t) => t.trim()),
  ]);

  const img2 = p.images[1]?.src;
  return {
    handle: slugify(title),
    title,
    product_type: kind,
    tags: [...tags].filter(Boolean).slice(0, 30),
    body_html: hasVersion
      ? `<p>${title} — disponible en versión Fan (17,95€) y Player (19,95€, más ajustada y transpirable), tallas ${sizes.join(", ")}. Personalización con parche disponible (+2€).</p>`
      : `<p>${title} — disponible en tallas ${sizes.join(", ")}. Personalización con parche disponible (+2€).</p>`,
    status: "active",
    options,
    variants,
    images: [{ src: p.images[0].src }].concat(img2 ? [{ src: img2 }] : []),
    _meta: { league, season, kind, kid },
  };
}

async function main() {
  const products = await scrapeAll();
  console.log(`\nScrapeados ${products.length} productos totales.`);
  const deduped = [];
  const seen = new Set();
  for (const p of products) {
    const key = p.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(p);
  }
  console.log(`Tras dedupe por título: ${deduped.length}.`);

  const payload = deduped.map(buildProduct);
  await writeFile(new URL("./import.json", import.meta.url), JSON.stringify(payload));
  console.log(`Escritos ${payload.length} productos en tools/import.json`);
  console.log(`Variantes totales: ${payload.reduce((s, p) => s + p.variants.length, 0)}`);
  console.log(`Adultos: ${payload.filter((p) => !p._meta.kid).length} · Niños: ${payload.filter((p) => p._meta.kid).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
