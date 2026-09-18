import Link from "next/link";
import { getCatalog, getLeagues } from "@/lib/catalog";

export const revalidate = 3600;

function buildHref(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ liga?: string; q?: string; page?: string }>;
}) {
  const { liga, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [leagues, { products, total, pageCount }] = await Promise.all([
    getLeagues(),
    getCatalog({ liga, q, page }),
  ]);

  return (
    <main className="page-width" style={{ padding: "4rem 2rem" }}>
      <h1 className="title text-3xl font-display mb-2">Catálogo</h1>
      <p className="fp-catalog__subheading text-white/60">
        {total} camisetas disponibles. Elige la tuya y accede al proveedor.
      </p>

      <form className="fp-catalog__toolbar" method="get">
        <input
          className="fp-catalog__search fp-chip"
          type="search"
          name="q"
          placeholder="Buscar equipo..."
          defaultValue={q ?? ""}
        />
        {liga && <input type="hidden" name="liga" value={liga} />}
        <button className="fp-chip" type="submit">
          Buscar
        </button>
      </form>

      <div className="fp-catalog__toolbar" role="group" aria-label="Filtrar por liga">
        <Link
          href={buildHref({ q })}
          className="fp-chip"
          aria-pressed={!liga}
        >
          Todas
        </Link>
        {leagues.map((league) => (
          <Link
            key={league}
            href={buildHref({ liga: league, q })}
            className="fp-chip"
            aria-pressed={liga === league}
          >
            {league}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="fp-catalog__empty" style={{ display: "block" }}>
          No hay resultados para esta búsqueda.
        </p>
      ) : (
        <div className="fp-catalog__grid">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="fp-card fp-in"
            >
              <div className="fp-card__inner">
                {product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="fp-card__meta">
                <span className="fp-card__team">{product.title}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav
          className="fp-catalog__loadmore"
          style={{ gap: "0.8rem" }}
          aria-label="Paginación"
        >
          {page > 1 && (
            <Link className="fp-chip" href={buildHref({ liga, q, page: page - 1 })}>
              Anterior
            </Link>
          )}
          <span className="fp-chip" aria-current="page">
            {page} / {pageCount}
          </span>
          {page < pageCount && (
            <Link className="fp-chip" href={buildHref({ liga, q, page: page + 1 })}>
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
