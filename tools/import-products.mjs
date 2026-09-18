// Importa tools/import.json a Shopify por Admin API (GraphQL productCreateBatch).
// Uso:  SHOPIFY_ADMIN_TOKEN=shpat_... node tools/import-products.mjs
// Lotes de 100 productos, reanudable, respeta rate limit.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const STORE = "futprov-store.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const ENDPOINT = `https://${STORE}/admin/api/2024-10/graphql.json`;
const BATCH = 100;
const LOG = new URL("./imported.log", import.meta.url);

if (!TOKEN) {
  console.error("Falta SHOPIFY_ADMIN_TOKEN (empieza por shpat_).");
  process.exit(1);
}

const doneHandles = new Set();
if (existsSync(LOG)) {
  const content = await readFile(LOG, "utf8");
  for (const line of content.trim().split("\n")) if (line) doneHandles.add(line);
}
console.log(`Reanudando: ${doneHandles.size} productos ya importados.`);

const products = JSON.parse(await readFile(new URL("./import.json", import.meta.url), "utf8"));
const pending = products.filter((p) => !doneHandles.has(p.handle));
console.log(`Pendientes de importar: ${pending.length} de ${products.length}.`);

const MUTATION = `mutation productCreateBatch($products: [ProductCreateBatchInput!]!) {
  productCreateBatch(products: $products) {
    product { id }
    userErrors { field message }
  }
}`;

function toBatchInput(p) {
  return {
    title: p.title,
    descriptionHtml: p.body_html,
    productType: p.product_type,
    vendor: "Fut Prov",
    status: "ACTIVE",
    handle: p.handle,
    tags: p.tags.join(", "),
    options: p.options.map((o) => ({ name: o.name, values: o.values })),
    variants: p.variants.map((v) => {
      const optionValues = [
        { name: "Talla", value: v.option1 },
        { name: "Parche", value: v.option2 },
      ];
      if (v.option3) optionValues.push({ name: "Versión", value: v.option3 });
      return {
        price: v.price.toFixed(2),
        compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice.toFixed(2) : undefined,
        optionValues,
      };
    }),
    images: p.images.map((i) => ({ src: i.src })),
  };
}

async function graphql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

let imported = 0;
let failed = 0;

for (let i = 0; i < pending.length; i += BATCH) {
  const slice = pending.slice(i, i + BATCH);
  const inputs = slice.map(toBatchInput);
  let data;
  try {
    data = await graphql(MUTATION, { products: inputs });
  } catch (e) {
    console.error(`Lote ${i / BATCH + 1}: error de red — ${e.message}. Detengo (podrás reanudar).`);
    await appendLog(slice.map((p) => p.handle)); // no marcar como ok, pero paramos limpio
    process.exit(1);
  }

  const errors = data?.data?.productCreateBatch?.userErrors || [];
  if (errors.length) {
    console.error(`Lote ${i / BATCH + 1}: ${errors.length} errores de usuario.`);
    console.error(JSON.stringify(errors.slice(0, 3)));
    await appendLog(slice.map((p) => p.handle)); // fuerzo parada
    process.exit(1);
  }

  await appendLog(slice.map((p) => p.handle));
  imported += slice.length;
  console.log(`Lote ${i / BATCH + 1}/${Math.ceil(pending.length / BATCH)}: +${slice.length} (acumulado ${imported}).`);

  // rate limit: pausa entre lotes
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`\nImportación completa: ${imported} productos creados. Fallos: ${failed}.`);

async function appendLog(handles) {
  const { appendFile } = await import("node:fs/promises");
  await appendFile(LOG, handles.join("\n") + "\n");
}
