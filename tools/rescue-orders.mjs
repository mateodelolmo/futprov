// Fase 0.3 del plan de migracion: rescata de la Admin API lo que NO esta en el repo
// y desaparecera con la tienda: pedidos, clientes y los ficheros subidos a Content > Files
// (los PDF entregables de los productos digitales).
//
// Uso:  SHOPIFY_ADMIN_TOKEN=shpat_... node tools/rescue-orders.mjs
// El token necesita permisos de lectura: read_orders, read_customers, read_files.

import { writeFile, mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const STORE = "futprov-store.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = `https://${STORE}/admin/api/2024-10`;
const OUT_DIR = new URL("./rescue/", import.meta.url);

if (!TOKEN) {
  console.error("Falta SHOPIFY_ADMIN_TOKEN (empieza por shpat_).");
  process.exit(1);
}

const headers = { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN };

async function fetchAllPages(path, key) {
  const results = [];
  let url = `${API}/${path}`;
  while (url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`ERROR ${path}: HTTP ${res.status} ${await res.text()}`);
      break;
    }
    const json = await res.json();
    results.push(...(json[key] || []));
    const link = res.headers.get("link") || "";
    const next = /<([^>]+)>;\s*rel="next"/.exec(link);
    url = next ? next[1] : null;
  }
  return results;
}

async function rescueOrders() {
  console.log("Descargando pedidos...");
  const orders = await fetchAllPages("orders.json?status=any&limit=250", "orders");
  await writeFile(new URL("./orders.json", OUT_DIR), JSON.stringify(orders, null, 2));
  console.log(`  ${orders.length} pedidos guardados en tools/rescue/orders.json`);
}

async function rescueCustomers() {
  console.log("Descargando clientes...");
  const customers = await fetchAllPages("customers.json?limit=250", "customers");
  await writeFile(new URL("./customers.json", OUT_DIR), JSON.stringify(customers, null, 2));
  console.log(`  ${customers.length} clientes guardados en tools/rescue/customers.json`);
}

async function rescueFiles() {
  console.log("Descargando lista de ficheros (Content > Files)...");
  // GraphQL: el REST admin no expone /files, hay que usar la Admin GraphQL API.
  const query = `
    query($cursor: String) {
      files(first: 100, after: $cursor) {
        edges {
          node {
            ... on GenericFile { id url alt originalFileSize }
            ... on MediaImage { id image { url } }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`;
  let cursor = null;
  const files = [];
  while (true) {
    const res = await fetch(`${API}/graphql.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { cursor } }),
    });
    const json = await res.json();
    if (json.errors) {
      console.error("ERROR files:", JSON.stringify(json.errors));
      break;
    }
    const conn = json.data.files;
    for (const edge of conn.edges) {
      const node = edge.node;
      const url = node.url || node.image?.url;
      if (url) files.push({ id: node.id, url, alt: node.alt || null });
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  console.log(`  ${files.length} ficheros encontrados. Descargando...`);
  await mkdir(new URL("./files/", OUT_DIR), { recursive: true });
  let ok = 0;
  for (const f of files) {
    try {
      const res = await fetch(f.url);
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const name = decodeURIComponent(f.url.split("/").pop().split("?")[0]);
      await pipeline(Readable.fromWeb(res.body), createWriteStream(new URL(`./files/${name}`, OUT_DIR)));
      ok++;
    } catch (e) {
      console.error(`  - ${f.url}: ${e.message}`);
    }
  }
  await writeFile(new URL("./files-index.json", OUT_DIR), JSON.stringify(files, null, 2));
  console.log(`  ${ok}/${files.length} ficheros descargados en tools/rescue/files/`);
}

await mkdir(OUT_DIR, { recursive: true });
await rescueOrders();
await rescueCustomers();
await rescueFiles();
console.log("\nRescate de pedidos/clientes/ficheros completo.");
