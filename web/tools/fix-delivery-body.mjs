// Mueve el WhatsApp de DigitalProduct.description (público) a deliveryBody (privado).
// Ejecutar desde web/: node tools/fix-delivery-body.mjs
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL="?([^"\n]+)"?/m)[1];

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

const SAFE_DESCRIPTIONS = {
  "proveedor-ropa": "Contacto directo por WhatsApp con el proveedor de ropa. Lo recibes al instante tras el pago.",
  "proveedor-perfumes": "Contacto directo por WhatsApp con el proveedor de perfumes. Lo recibes al instante tras el pago.",
  "proveedor-vapes": "Contacto directo por WhatsApp con el proveedor de vapes. Lo recibes al instante tras el pago.",
  "proveedor-pack-3": "Accede a los 4 contactos de proveedor en un solo pack: camisetas, ropa, perfumes y vapes. Ahorra frente a comprarlos por separado.",
};

async function main() {
  const products = await db.digitalProduct.findMany({ where: { deliveryType: "CONTACT" } });

  for (const p of products) {
    if (p.deliveryBody) {
      console.log(`skip ${p.handle} (deliveryBody ya poblado)`);
      continue;
    }
    const rawBody = p.description ?? "";
    const safe = SAFE_DESCRIPTIONS[p.handle];
    await db.digitalProduct.update({
      where: { id: p.id },
      data: {
        deliveryBody: rawBody,
        ...(safe ? { description: `<p>${safe}</p>` } : {}),
      },
    });
    console.log(`fixed ${p.handle}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
