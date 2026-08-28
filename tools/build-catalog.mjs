// Genera assets/catalog.json (escaparate curado) a partir de camisfutbol.shop.
// No comprable: solo título, imágenes, liga y tipo. No se copian precios.
// Ejecutar una vez: node tools/build-catalog.mjs

import { writeFile } from "node:fs/promises";

const SOURCE = "https://camisfutbol.shop";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

// handle de colección -> [etiqueta liga, tipo, cuántos coger]
const PLAN = [
  ["laliga-26-27", "LaLiga", "equipacion", 45],
  ["laliga", "LaLiga", "equipacion", 20],
  ["26-27-premier-league", "Premier League", "equipacion", 40],
  ["premier-league", "Premier League", "equipacion", 20],
  ["bundesliga-26-27", "Bundesliga", "equipacion", 6],
  ["ligue-1-26-27", "Ligue 1", "equipacion", 8],
  ["retro", "Retro", "retro", 100],
  ["selecciones", "Selecciones", "seleccion", 70],
  ["mujer", "Mujer", "mujer", 35],
  ["ninos", "Niños", "nino", 35],
  ["chandal", "Chándal", "chandal", 25],
  ["balones", "Balones", "balon", 3],
  ["productos-destacados-1", "Destacados", "equipacion", 30],
  ["productos-destacados-2", "Destacados", "equipacion", 30],
];

async function fetchCollection(handle, take) {
  const url = `${SOURCE}/collections/${handle}/products.json?limit=250`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${handle}: HTTP ${res.status}`);
  const { products } = await res.json();
  return products.slice(0, take);
}

function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

const seen = new Set();
const catalog = [];

for (const [handle, league, kind, take] of PLAN) {
  const products = await fetchCollection(handle, take);
  for (const p of products) {
    const key = normalizeTitle(p.title);
    if (seen.has(key)) continue;
    if (!p.images?.length) continue;
    seen.add(key);
    catalog.push({
      id: p.id,
      title: p.title,
      league,
      kind,
      img: p.images[0].src,
      img2: p.images[1]?.src ?? p.images[0].src,
    });
  }
  console.log(`${handle}: +${products.length} (total acumulado ${catalog.length})`);
}

const outPath = new URL("../assets/catalog.json", import.meta.url);
await writeFile(outPath, JSON.stringify(catalog));
console.log(`\nEscritos ${catalog.length} productos en assets/catalog.json`);
