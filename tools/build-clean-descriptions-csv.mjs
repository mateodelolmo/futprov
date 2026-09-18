// Genera CSV para importar en Shopify (Productos > Importar) que limpia la
// descripción de cada camiseta: quita precio, tallas y parche.
// Solo trae Handle + Body (HTML) -> Shopify solo toca ese campo al importar.
import fs from 'node:fs';

const src = fs.readFileSync('tools/import.csv', 'utf8').split(/\r?\n/);
const seen = new Set();
const rows = [['Handle', 'Title', 'Body (HTML)']];

for (const line of src) {
  const m = line.match(/^([a-z0-9-]+),([^,]*),"(.*?)",/);
  if (!m) continue;
  const [, handle, title] = m;
  if (seen.has(handle) || !title) continue;
  seen.add(handle);
  const body = `<p>${title}. Disponible en el catálogo — consigue el contacto del proveedor para pedirla.</p>`;
  rows.push([handle, title, body]);
}

const csv = rows
  .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
  .join('\n');

fs.writeFileSync('tools/clean-descriptions.csv', csv);
console.log(`Generado tools/clean-descriptions.csv con ${rows.length - 1} productos.`);
