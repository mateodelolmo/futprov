import { getCatalog, getLeagues } from "@/lib/catalog";

export default async function AdminCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; liga?: string; page?: string }>;
}) {
  const { q, liga, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ products, total, pageCount }, leagues] = await Promise.all([
    getCatalog({ q, liga, page }),
    getLeagues(),
  ]);

  return (
    <div>
      <h1>Catálogo ({total} camisetas)</h1>
      <p className="admin-readonly-banner">Solo lectura. La edición del catálogo llegará más adelante.</p>

      <form className="admin-filters" action="/admin/catalogo">
        <input type="search" name="q" placeholder="Buscar por título" defaultValue={q} />
        <select name="liga" defaultValue={liga ?? ""}>
          <option value="">Todas las ligas</option>
          {leagues.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button type="submit" className="admin-filters__submit">
          Filtrar
        </button>
      </form>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Liga</th>
              <th>Tipo</th>
              <th>Niño</th>
              <th>Precio base</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.league ?? "—"}</td>
                <td>{p.type}</td>
                <td>{p.isKid ? "Sí" : "No"}</td>
                <td>{Number(p.basePrice).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
                <td>{p.trackStock ? p.stockQty : "Sin control"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageCount > 1 && (
          <div className="admin-pagination">
            {page > 1 && (
              <a href={`/admin/catalogo?page=${page - 1}${q ? `&q=${q}` : ""}${liga ? `&liga=${liga}` : ""}`}>
                ← Anterior
              </a>
            )}
            <span>
              Página {page} de {pageCount}
            </span>
            {page < pageCount && (
              <a href={`/admin/catalogo?page=${page + 1}${q ? `&q=${q}` : ""}${liga ? `&liga=${liga}` : ""}`}>
                Siguiente →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
