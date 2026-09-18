// Elige camisetas reales por liga y genera WebP livianos para la home (no depende de cdn.shopify.com).
// Ejecutar desde web/: node tools/build-home-images.mjs
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL="?([^"\n]+)"?/m)[1];
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

const RESCUE_DIR = path.resolve(import.meta.dirname, "../../tools/rescue/images");
const OUT_DIR = path.resolve(import.meta.dirname, "../public/home");
const EXTS = ["jpg", "jpeg", "png", "webp"];

const SHOWCASE_LEAGUES = ["LaLiga", "Premier League", "Selecciones", "Retro", "Serie A", "Bundesliga"];

function findSourceFile(handle) {
  for (const ext of EXTS) {
    const p = path.join(RESCUE_DIR, `${handle}-1.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

async function convert(srcPath, outName, width) {
  const outPath = path.join(OUT_DIR, outName);
  const img = sharp(srcPath).resize({ width, withoutEnlargement: true }).webp({ quality: 72 });
  const info = await img.toFile(outPath);
  return { src: `/home/${outName}`, width: info.width, height: info.height };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = { showcase: [], strip: [] };

  for (const league of SHOWCASE_LEAGUES) {
    const products = await db.product.findMany({
      where: { active: true, league, images: { some: {} } },
      orderBy: { title: "asc" },
      take: 20,
    });
    const picked = products.find((p) => findSourceFile(p.handle));
    if (!picked) {
      console.warn(`sin imagen local para liga ${league}, se omite del showcase`);
      continue;
    }
    const src = findSourceFile(picked.handle);
    const { src: outSrc, width, height } = await convert(src, `showcase-${picked.handle}.webp`, 900);
    const count = await db.product.count({ where: { active: true, league } });
    manifest.showcase.push({ handle: picked.handle, title: picked.title, league, count, src: outSrc, width, height });
    console.log(`showcase ${league} -> ${picked.handle}`);
  }

  const stripCandidates = await db.product.findMany({
    where: { active: true, images: { some: {} }, league: { in: SHOWCASE_LEAGUES } },
    orderBy: { title: "asc" },
    take: 60,
  });
  let stripCount = 0;
  for (const p of stripCandidates) {
    if (stripCount >= 12) break;
    if (manifest.showcase.some((s) => s.handle === p.handle)) continue;
    const src = findSourceFile(p.handle);
    if (!src) continue;
    const { src: outSrc, width, height } = await convert(src, `strip-${p.handle}.webp`, 400);
    manifest.strip.push({ handle: p.handle, title: p.title, src: outSrc, width, height });
    stripCount++;
  }
  console.log(`tira del hero: ${manifest.strip.length} fotos`);

  writeFileSync(
    path.resolve(import.meta.dirname, "../lib/home-showcase.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`manifiesto escrito: ${manifest.showcase.length} showcase + ${manifest.strip.length} tira`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
