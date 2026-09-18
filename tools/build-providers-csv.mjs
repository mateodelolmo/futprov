import fs from 'node:fs';

const headers = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category',
  'Type', 'Tags', 'Published', 'Variant Price', 'Variant Compare At Price', 'Image Src', 'Status',
];

// Construyo las descripciones como concatenacion para evitar que el editor
// altere las etiquetas HTML al guardar.
function P(s) { return '<p>' + s + '<BR_CLOSE>'; }
const providers = [
  {
    handle: 'proveedor-ropa',
    title: 'PROVEEDOR DE ROPA',
    price: '9.99',
    desc: 'Contacto directo por WhatsApp (+86 131 6486 5952) del proveedor de ropa. Pide el catalogo completo directamente o consultalo en la descripcion si esta disponible.',
    tags: 'Proveedor, Ropa',
    image: '',
  },
  {
    handle: 'proveedor-perfumes',
    title: 'PROVEEDOR DE PERFUMES',
    price: '9.99',
    desc: 'Contacto directo por WhatsApp (+86 158 1870 9179) del proveedor de perfumes. Pide el catalogo completo directamente o consultalo en la descripcion si esta disponible.',
    tags: 'Proveedor, Perfumes',
    image: '',
  },
  {
    handle: 'proveedor-pack-3',
    title: 'PACK DE LOS 4 PROVEEDORES (CAMISETAS + ROPA + PERFUMES + VAPES)',
    price: '24.95',
    compareAt: '39.96',
    desc: 'Accede a los 4 contactos de proveedor en un solo pack: camisetas, ropa, perfumes y vapes. Ahorra frente a comprarlos por separado.',
    tags: 'Proveedor, Pack',
    image: '',
  },
  {
    handle: 'proveedor-vapes',
    title: 'PROVEEDOR DE VAPES',
    price: '9.99',
    desc: 'Contacto directo por WhatsApp (+86 137 9086 0322) del proveedor de vapers. Pide el catalogo completo directamente o consultalo en la descripcion si esta disponible.',
    tags: 'Proveedor, Vapes',
    image: '',
  },
];

const rows = [headers];
for (const p of providers) {
  const body = '<p>' + p.desc + '<' + '/p>';
  rows.push([
    p.handle,
    p.title,
    body,
    'Fut Prov',
    '',
    'Proveedor',
    p.tags,
    'TRUE',
    p.price,
    p.compareAt || '',
    p.image,
    'active',
  ]);
}

const csv = rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
fs.writeFileSync('tools/proveedores.csv', csv);
console.log(`Generado tools/proveedores.csv con ${providers.length} proveedores.`);
