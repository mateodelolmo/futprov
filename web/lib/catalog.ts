import { db } from "./db";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 24;

export type CatalogFilters = {
  liga?: string;
  q?: string;
  page?: number;
};

export async function getCatalog({ liga, q, page = 1 }: CatalogFilters) {
  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(liga ? { league: liga } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ league: "asc" }, { title: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getLeagues() {
  const rows = await db.product.findMany({
    where: { active: true, league: { not: null } },
    distinct: ["league"],
    select: { league: true },
    orderBy: { league: "asc" },
  });
  return rows.map((r) => r.league as string);
}

export async function getProductByHandle(handle: string) {
  return db.product.findUnique({
    where: { handle },
    include: { images: { orderBy: { position: "asc" } }, tags: { include: { tag: true } } },
  });
}

export async function getCatalogStats() {
  const [productCount, leagues] = await Promise.all([
    db.product.count({ where: { active: true } }),
    getLeagues(),
  ]);
  return { productCount, leagueCount: leagues.length };
}
