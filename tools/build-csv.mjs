// Genera tools/import.csv (formato Shopify "Import products from CSV") desde tools/import.json.
// Uso: node tools/build-csv.mjs

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

const products = JSON.parse(await readFile(new URL("./import.json", import.meta.url), "utf8"));

const lines = [COLUMNS.join(",")];

for (const p of products) {
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
        "Image Src": isFirst ? p.images[0]?.src || "" : "",
        "Image Position": isFirst ? 1 : "",
        Status: isFirst ? "active" : "",
      })
    );
  });

  // fila extra para la segunda imagen del producto
  if (p.images[1]) {
    lines.push(row({ Handle: p.handle, "Image Src": p.images[1].src, "Image Position": 2 }));
  }
}

await writeFile(new URL("./import.csv", import.meta.url), lines.join("\n") + "\n", "utf8");
console.log(`Escritas ${lines.length - 1} filas en tools/import.csv (${products.length} productos).`);
