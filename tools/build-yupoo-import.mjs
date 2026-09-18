// Genera tools/yupoo-import.json a partir de tools/yupoo-missing.json: mismo formato de
// producto que usa build-import.mjs/build-csv.mjs, pero con "images" vacío (se rellena
// después con merge-yupoo-csv.mjs, cuando el usuario suba las fotos a Shopify Files).
// Uso: node tools/build-yupoo-import.mjs

import { readFile, writeFile } from "node:fs/promises";
import { ADULT_SIZES, KID_SIZES, slugify, buildOptions, buildVariants } from "./lib/product.mjs";

const AUDIENCE_TAG = { adulto: "Adulto", nino: "Niño", mujer: "Mujer" };

function buildProduct(p) {
  const sizes = p.audience === "nino" ? KID_SIZES : ADULT_SIZES;
  const options = buildOptions(sizes, true);
  const variants = buildVariants(sizes, true);
  const tags = [AUDIENCE_TAG[p.audience], "Yupoo", `Temporada ${p.seasonKey}`].filter(Boolean);

  return {
    handle: slugify(p.title),
    title: p.title,
    product_type: "Camiseta",
    tags,
    body_html: `<p>${p.title} — disponible en versión Fan (17,95€) y Player (19,95€, más ajustada y transpirable), tallas ${sizes.join(", ")}. Personalización con parche disponible (+2€).</p>`,
    status: "active",
    options,
    variants,
    images: [],
  };
}

const missing = JSON.parse(await readFile(new URL("./yupoo-missing.json", import.meta.url), "utf8"));
const payload = missing.map(buildProduct);
await writeFile(new URL("./yupoo-import.json", import.meta.url), JSON.stringify(payload));
console.log(`Escritos ${payload.length} productos en tools/yupoo-import.json`);
console.log(`Variantes totales: ${payload.reduce((s, p) => s + p.variants.length, 0)}`);
