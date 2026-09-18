// Cruza el CSV exportado de Shopify Admin -> Content -> Files (URLs públicas ya subidas)
// con tools/yupoo-import.json (datos de producto) por nombre de archivo, y escribe
// tools/yupoo-import.csv listo para Settings -> Import products.
//
// Uso: node tools/merge-yupoo-csv.mjs tools/files-export.csv

import { readFile, writeFile } from "node:fs/promises";

const COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
  "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
  "Variant Requires Shipping", "Variant Taxable",
  "Image Src", "Image Position", "Status",
];

function csvField(v) {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function row(obj) {
  return COLUMNS.map((c) => csvField(obj[c])).join(",");
}

// parser CSV simple (soporta comillas), suficiente para el export de Shopify Files
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const filesPath = process.argv[2];
if (!filesPath) {
  console.error("Uso: node tools/merge-yupoo-csv.mjs <export-de-shopify-files.csv>");
  process.exit(1);
}

const filesCsv = parseCsv(await readFile(filesPath, "utf8"));
const header = filesCsv[0].map((h) => h.trim().toLowerCase());
const urlCol = header.findIndex((h) => h.includes("url"));
if (urlCol === -1) {
  console.error(`No encuentro columna de URL en el export. Cabecera: ${filesCsv[0].join(" | ")}`);
  process.exit(1);
}

// handle-1.jpg / handle-2.png, con posible sufijo random de Shopify tras el número (handle-1_ab12.jpg)
const NAME_RE = /([a-z0-9-]+)-([12])(?:_[a-zA-Z0-9]+)?\.(jpe?g|png)$/i;

const byHandle = new Map(); // handle -> {1: url, 2: url}
let matched = 0;
let skipped = 0;
for (let i = 1; i < filesCsv.length; i++) {
  const url = filesCsv[i][urlCol];
  if (!url) continue;
  const filename = decodeURIComponent(url.split("/").pop().split("?")[0]);
  const m = filename.match(NAME_RE);
  if (!m) { skipped++; continue; }
  const [, handle, pos] = m;
  if (!byHandle.has(handle)) byHandle.set(handle, {});
  byHandle.get(handle)[pos] = url;
  matched++;
}
console.log(`URLs con nombre reconocible: ${matched}. Sin reconocer: ${skipped}.`);

const products = JSON.parse(await readFile(new URL("./yupoo-import.json", import.meta.url), "utf8"));

const lines = [COLUMNS.join(",")];
let withImages = 0;
let noImages = 0;

for (const p of products) {
  const imgs = byHandle.get(p.handle);
  if (imgs?.["1"]) withImages++; else noImages++;

  p.variants.forEach((v, i) => {
    const isFirst = i === 0;
    lines.push(
      row({
        Handle: p.handle,
        Title: isFirst ? p.title : "",
        "Body (HTML)": isFirst ? p.body_html : "",
        Vendor: isFirst ? "Fut Prov" : "",
        Type: isFirst ? p.product_type : "",
        Tags: isFirst ? p.tags.join(", ") : "",
        Published: isFirst ? "TRUE" : "",
        "Option1 Name": isFirst ? p.options[0].name : "",
        "Option1 Value": v.option1,
        "Option2 Name": isFirst ? p.options[1].name : "",
        "Option2 Value": v.option2,
        "Option3 Name": isFirst && p.options[2] ? p.options[2].name : "",
        "Option3 Value": v.option3 || "",
        "Variant Inventory Tracker": "",
        "Variant Inventory Qty": 100,
        "Variant Inventory Policy": "continue",
        "Variant Fulfillment Service": "manual",
        "Variant Price": v.price.toFixed(2),
        "Variant Compare At Price": v.compareAtPrice != null ? v.compareAtPrice.toFixed(2) : "",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Image Src": isFirst ? imgs?.["1"] || "" : "",
        "Image Position": isFirst && imgs?.["1"] ? 1 : "",
        Status: isFirst ? "active" : "",
      })
    );
  });

  if (imgs?.["2"]) {
    lines.push(row({ Handle: p.handle, "Image Src": imgs["2"], "Image Position": 2 }));
  }
}

await writeFile(new URL("./yupoo-import.csv", import.meta.url), lines.join("\n") + "\n", "utf8");
console.log(`Escritas ${lines.length - 1} filas en tools/yupoo-import.csv.`);
console.log(`Productos con foto: ${withImages}. Sin foto (revisar): ${noImages}.`);
