import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";

const db = new PrismaClient();

const IMPORT_JSON = path.resolve(__dirname, "../../tools/import.json");
const PROVEEDORES_CSV = path.resolve(__dirname, "../../tools/proveedores.csv");

type RawVariant = { price: number; compareAtPrice: number };
type RawProduct = {
  handle: string;
  title: string;
  product_type: string;
  tags: string[];
  body_html: string;
  options: { name: string; values: string[] }[];
  variants: RawVariant[];
  images: { src: string }[];
  _meta: { league: string | null; season: string | null; kind: string; kid: boolean };
};

function slugifyTag(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedTags(products: RawProduct[]) {
  const bySlug = new Map<string, string>(); // slug -> canonical label (first seen)
  for (const p of products) {
    for (const raw of p.tags) {
      const slug = slugifyTag(raw);
      if (!slug) continue;
      if (!bySlug.has(slug)) bySlug.set(slug, raw);
    }
  }
  await db.tag.createMany({
    data: [...bySlug.entries()].map(([slug, label]) => ({ slug, label })),
    skipDuplicates: true,
  });
  const all = await db.tag.findMany();
  return new Map(all.map((t) => [t.slug, t.id]));
}

async function seedProducts(products: RawProduct[], tagIdBySlug: Map<string, string>) {
  let created = 0;
  for (const p of products) {
    const prices = p.variants.map((v) => v.price);
    const basePrice = Math.min(...prices);
    const sizeOption = p.options.find((o) => o.name === "Talla");
    const hasVersions = p.options.some((o) => o.name === "Versión");

    const tagSlugs = [...new Set(p.tags.map(slugifyTag).filter(Boolean))];
    const tagIds = tagSlugs.map((slug) => tagIdBySlug.get(slug)).filter((id): id is string => !!id);

    await db.product.upsert({
      where: { handle: p.handle },
      update: {},
      create: {
        handle: p.handle,
        title: p.title,
        description: p.body_html,
        type: p.product_type,
        league: p._meta.league,
        season: p._meta.season,
        kind: p._meta.kind,
        isKid: p._meta.kid,
        sizes: sizeOption?.values ?? [],
        hasVersions,
        basePrice,
        images: {
          create: p.images.map((img, i) => ({ url: img.src, position: i })),
        },
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
    created++;
  }
  return created;
}

async function seedDigitalProducts() {
  const csv = readFileSync(PROVEEDORES_CSV, "utf-8");
  const rows: Record<string, string>[] = parse(csv, { columns: true, skip_empty_lines: true });

  for (const row of rows) {
    const handle = row["Handle"];
    const priceCents = Math.round(parseFloat(row["Variant Price"]) * 100);
    const compareAtRaw = row["Variant Compare At Price"];
    const compareAtCents = compareAtRaw ? Math.round(parseFloat(compareAtRaw) * 100) : null;

    await db.digitalProduct.upsert({
      where: { handle },
      update: {},
      create: {
        handle,
        title: row["Title"],
        description: row["Body (HTML)"],
        priceCents,
        compareAtCents,
        deliveryType: handle === "guia-digital-pdf" ? "PDF" : "CONTACT",
        active: row["Status"] === "active",
      },
    });
  }
  return rows.length;
}

async function main() {
  const products: RawProduct[] = JSON.parse(readFileSync(IMPORT_JSON, "utf-8"));

  console.log(`Sembrando ${products.length} productos escaparate...`);
  const tagIdBySlug = await seedTags(products);
  console.log(`${tagIdBySlug.size} tags normalizados.`);
  const created = await seedProducts(products, tagIdBySlug);
  console.log(`${created} productos insertados/actualizados.`);

  const digitalCount = await seedDigitalProducts();
  console.log(`${digitalCount} productos digitales insertados/actualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
