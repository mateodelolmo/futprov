// Un solo uso: carga el contacto real de WhatsApp de cada proveedor (ropa, perfumes,
// vapes) y la guía de compra, a partir de los PDFs/capturas que pasó el cliente.
// Ejecutar desde web/: node tools/set-provider-content.mjs
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL="?([^"\n]+)"?/m)[1];

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

const CONTENT = {
  "proveedor-ropa": `
    <p>Para pedir ropa, escribe al proveedor por WhatsApp al <strong>+86 131 6486 5952</strong>.</p>
    <p>Puedes pedirle directamente el catálogo de ropa, o consultarlo en su biografía si está disponible ahí.</p>
  `.trim(),
  "proveedor-perfumes": `
    <p>Para pedir los perfumes, escribe al proveedor por WhatsApp al <strong>+86 158 1870 9179</strong>.</p>
    <p>Puedes pedirle directamente el catálogo de perfumes, o consultarlo en su biografía si está disponible ahí.</p>
  `.trim(),
  "proveedor-vapes": `
    <p>Aquí tienes el contacto del proveedor de vapes.</p>
    <p>Para más información sobre los productos, contacta con el proveedor en el número <strong>+86 137 9086 0322</strong>.</p>
    <p>Si necesitas información sobre el catálogo, disponibilidad o características de los productos, puedes consultárselo directamente.</p>
  `.trim(),
  "guia-digital-pdf": `
    <p><strong>El teléfono de tu proveedor de camisetas es +86 136 7096 4782.</strong></p>
    <p>¿Qué hacer ahora?</p>
    <ol style="padding-left: 1.4rem;">
      <li>Agrega el teléfono a WhatsApp.</li>
      <li>Avisa al proveedor de que vienes de este número: <strong>650 24 64 01</strong>.</li>
      <li>En su biografía encontrarás el enlace a su catálogo.</li>
      <li>Escoge las camisetas que quieras y haz captura de pantalla.</li>
      <li>Envíasela al proveedor.</li>
      <li>Él te responderá (según la hora en China).</li>
      <li>Paga a través de PayPal. Recomendamos pagar como producto o servicio: en caso de retención en aduanas o pérdida, PayPal te devuelve el dinero (tiene un coste extra de unos 3&nbsp;€, pero da protección al comprador). Por amigos o familiares no hay protección.</li>
      <li>Te mandará un formulario para rellenar con tus datos de envío.</li>
      <li>En 9-13 días recibirás el pedido con CTT Express.</li>
    </ol>
    <p><em>Consejo: prueba primero con un pedido pequeño para comprobar fiabilidad, tiempos de entrega y calidad.</em></p>
    <p><strong>Aclaración:</strong> no nos hacemos responsables a partir de 5 unidades; por eso recomendamos probar primero con esa cantidad.</p>
  `.trim(),
};

async function main() {
  for (const [handle, deliveryBody] of Object.entries(CONTENT)) {
    const product = await db.digitalProduct.findUnique({ where: { handle } });
    if (!product) {
      console.log(`skip ${handle} (no existe)`);
      continue;
    }
    await db.digitalProduct.update({ where: { id: product.id }, data: { deliveryBody } });
    console.log(`updated ${handle}`);
  }
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
