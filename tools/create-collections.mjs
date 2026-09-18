// Crea las colecciones Smart (auto por tag) en Shopify, mirror de camisfutbol.shop.
// Uso:  SHOPIFY_ADMIN_TOKEN=shpat_... node tools/create-collections.mjs

const STORE = "futprov-store.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = `https://${STORE}/admin/api/2024-10`;

if (!TOKEN) {
  console.error("Falta SHOPIFY_ADMIN_TOKEN (empieza por shpat_).");
  process.exit(1);
}

// [handle, título, tag, orden]
const COLLECTIONS = [
  ["laliga", "LaLiga", "laliga", 1],
  ["premier-league", "Premier League", "premier-league", 2],
  ["serie-a", "Serie A", "serie-a", 3],
  ["bundesliga", "Bundesliga", "bundesliga", 4],
  ["ligue-1", "Ligue 1", "ligue-1", 5],
  ["retro", "Retro", "retro", 6],
  ["selecciones", "Selecciones", "tipo-selecciones", 7],
  ["chandal", "Chándal", "chandal", 8],
  ["mujer", "Mujer", "mujer", 9],
  ["ninos", "Niños", "niño", 10],
  ["temporada-2026", "Temporada 26-27", "26-27", 11],
  ["temporada-2025", "Temporada 25-26", "25-26", 12],
  ["retro-1980", "Retro 1980-90", "1980-1990", 13],
  ["retro-1990", "Retro 1990-2000", "1990-2000", 14],
  ["retro-2000", "Retro 2000-2010", "2000-2010", 15],
];

async function createCollection({ handle, title, tag }) {
  const rules = [{ column: "tag", relation: "equals", condition: tag }];
  const body = {
    smart_collection: {
      title,
      handle,
      rules,
      rule_disjunction: false,
      sort_order: "best-selling",
      published: true,
    },
  };
  const res = await fetch(`${API}/smart_collections.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    // ignora "already exists"
    if (data?.errors && JSON.stringify(data.errors).includes("already been taken")) {
      console.log(`  (ya existe) ${title}`);
      return;
    }
    console.error(`  ERROR ${title}:`, JSON.stringify(data.errors || data));
    return;
  }
  console.log(`  creada ${title} (#${data.smart_collection.id})`);
}

for (const [handle, title, tag] of COLLECTIONS) {
  await createCollection({ handle, title, tag });
  await new Promise((r) => setTimeout(r, 600));
}
console.log("\nColecciones listas.");
