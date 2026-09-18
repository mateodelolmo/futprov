import { db } from "./db";

const HOME_ORDER = [
  "guia-digital-pdf",
  "proveedor-ropa",
  "proveedor-perfumes",
  "proveedor-pack-3",
  "proveedor-vapes",
];

export async function getActiveDigitalProducts() {
  const products = await db.digitalProduct.findMany({ where: { active: true } });
  return products.sort((a, b) => HOME_ORDER.indexOf(a.handle) - HOME_ORDER.indexOf(b.handle));
}

export async function getDigitalProductByHandle(handle: string) {
  return db.digitalProduct.findUnique({ where: { handle } });
}
