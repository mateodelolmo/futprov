// Importa tools/yupoo-missing.json a Shopify: para cada álbum entra en Yupoo, descarga
// hasta 2 fotos (con Referer, porque Yupoo bloquea el hotlink directo), las sube por
// Admin API (staged upload) y crea el producto con sus 28 variantes Talla×Parche×Versión.
// Reanudable (tools/yupoo-imported.log). Respeta el orden: descarga -> staged upload -> productSet.
//
// Uso:
//   SHOPIFY_ADMIN_TOKEN=shpat_... node tools/import-yupoo.mjs --dry-run --limit 20
//   SHOPIFY_ADMIN_TOKEN=shpat_... node tools/import-yupoo.mjs --limit 20
//   SHOPIFY_ADMIN_TOKEN=shpat_... node tools/import-yupoo.mjs

import { readFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import {
  ADULT_SIZES,
  KID_SIZES,
  slugify,
  buildOptions,
  buildVariants,
} from "./lib/product.mjs";

const STORE = "futprov-store.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const ENDPOINT = `https://${STORE}/admin/api/2024-10/graphql.json`;
const LOG = new URL("./yupoo-imported.log", import.meta.url);
const YUPOO_UID = "1022669895";
const YUPOO_BASE = "https://x.yupoo.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

if (!DRY_RUN && !TOKEN) {
  console.error("Falta SHOPIFY_ADMIN_TOKEN (empieza por shpat_). Usa --dry-run para probar sin token.");
  process.exit(1);
}

const doneHandles = new Set();
if (existsSync(LOG)) {
  const content = await readFile(LOG, "utf8");
  for (const line of content.trim().split("\n")) if (line) doneHandles.add(line);
}
console.log(`Reanudando: ${doneHandles.size} productos ya importados.`);

const missing = JSON.parse(await readFile(new URL("./yupoo-missing.json", import.meta.url), "utf8"));
const withHandle = missing.map((m) => ({ ...m, handle: slugify(m.title) }));
const pending = withHandle.filter((m) => !doneHandles.has(m.handle)).slice(0, LIMIT);
console.log(`Pendientes: ${pending.length} de ${withHandle.length} (límite ${LIMIT === Infinity ? "ninguno" : LIMIT}).`);

async function getAlbumPhotoUrls(albumId) {
  const res = await fetch(`${YUPOO_BASE}/photos/${YUPOO_UID}/albums/${albumId}?uid=1`, {
    headers: { "User-Agent": UA, Referer: `${YUPOO_BASE}/` },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const urls = [];
  const re = /data-src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) && urls.length < 2) {
    urls.push(m[1]);
  }
  return urls;
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Referer: `${YUPOO_BASE}/` } });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.startsWith("image/")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = contentType.includes("png") ? "png" : "jpg";
  return { buf, contentType, filename: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}` };
}

async function graphql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 300))}`);
  return res.json();
}

const STAGED_UPLOADS_MUTATION = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets { url resourceUrl parameters { name value } }
    userErrors { field message }
  }
}`;

async function stageAndUploadImage(image) {
  const stageData = await graphql(STAGED_UPLOADS_MUTATION, {
    input: [
      {
        resource: "IMAGE",
        filename: image.filename,
        mimeType: image.contentType,
        fileSize: String(image.buf.length),
        httpMethod: "POST",
      },
    ],
  });
  const errors = stageData?.data?.stagedUploadsCreate?.userErrors || [];
  if (errors.length) throw new Error(`stagedUploadsCreate: ${JSON.stringify(errors)}`);
  const target = stageData.data.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([image.buf], { type: image.contentType }), image.filename);

  const uploadRes = await fetch(target.url, { method: "POST", body: form });
  if (!uploadRes.ok) throw new Error(`Subida a ${target.url} falló: HTTP ${uploadRes.status}`);

  return target.resourceUrl;
}

const PRODUCT_SET_MUTATION = `mutation productSet($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product { id handle }
    userErrors { field message }
  }
}`;

function toProductSetInput(p, resourceUrls) {
  const sizes = p.audience === "nino" ? KID_SIZES : ADULT_SIZES;
  const hasVersion = true; // solo camisetas (chándal/balones ya se filtran en scrape-yupoo.mjs)
  const options = buildOptions(sizes, hasVersion);
  const variants = buildVariants(sizes, hasVersion);

  const tags = [p.audience === "nino" ? "Niño" : p.audience === "mujer" ? "Mujer" : "Adulto", "Yupoo"].filter(Boolean);

  return {
    title: p.title,
    descriptionHtml: `<p>${p.title} — disponible en versión Fan (17,95€) y Player (19,95€, más ajustada y transpirable), tallas ${sizes.join(", ")}. Personalización con parche disponible (+2€).</p>`,
    productType: "Camiseta",
    vendor: "Fut Prov",
    status: "ACTIVE",
    handle: p.handle,
    tags,
    productOptions: options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: v })) })),
    variants: variants.map((v) => {
      const optionValues = [
        { optionName: "Talla", name: v.option1 },
        { optionName: "Parche", name: v.option2 },
      ];
      if (v.option3) optionValues.push({ optionName: "Versión", name: v.option3 });
      return {
        price: v.price.toFixed(2),
        compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice.toFixed(2) : undefined,
        optionValues,
      };
    }),
    files: resourceUrls.map((url) => ({ originalSource: url, contentType: "IMAGE" })),
  };
}

let created = 0;
let skippedNoPhotos = 0;
let failed = 0;

for (const p of pending) {
  try {
    const photoUrls = await getAlbumPhotoUrls(p.albumId);
    if (photoUrls.length === 0) {
      console.log(`- ${p.handle}: sin fotos (álbum protegido o vacío), salto.`);
      skippedNoPhotos++;
      await appendLog(p.handle);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] ${p.handle} — ${photoUrls.length} foto(s) — ${p.title}`);
      created++;
      continue;
    }

    const resourceUrls = [];
    for (const url of photoUrls) {
      const image = await downloadImage(url);
      if (!image) continue;
      resourceUrls.push(await stageAndUploadImage(image));
    }
    if (resourceUrls.length === 0) {
      console.log(`- ${p.handle}: fotos bloqueadas al descargar, salto.`);
      skippedNoPhotos++;
      await appendLog(p.handle);
      continue;
    }

    const input = toProductSetInput(p, resourceUrls);
    const data = await graphql(PRODUCT_SET_MUTATION, { input });
    const errors = data?.data?.productSet?.userErrors || [];
    if (errors.length) {
      console.error(`- ${p.handle}: error — ${JSON.stringify(errors)}`);
      failed++;
      continue; // no se marca como hecho: se reintentará en la próxima pasada
    }

    console.log(`+ ${p.handle} (${resourceUrls.length} fotos)`);
    created++;
    await appendLog(p.handle);
  } catch (e) {
    console.error(`- ${p.handle}: excepción — ${e.message}`);
    failed++;
  }

  await new Promise((r) => setTimeout(r, 600));
}

console.log(`\nCreados: ${created}. Sin fotos: ${skippedNoPhotos}. Fallos: ${failed}.`);

async function appendLog(handle) {
  if (DRY_RUN) return;
  await appendFile(LOG, handle + "\n");
}
