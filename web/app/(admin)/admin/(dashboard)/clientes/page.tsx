import Link from "next/link";
import { db } from "@/lib/db";
import { formatEuros } from "@/lib/money";

const PAGE_SIZE = 30;

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = q ? { email: { contains: q, mode: "insensitive" as const } } : {};

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { orders: { where: { status: "PAID" }, select: { totalCents: true } } },
    }),
    db.customer.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1>Clientes</h1>

      <form className="admin-filters" action="/admin/clientes">
        <input type="search" name="q" placeholder="Buscar por email" defaultValue={q} />
        <button type="submit" className="admin-filters__submit">
          Buscar
        </button>
      </form>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Pedidos</th>
              <th>Total gastado</th>
              <th>Desde</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/clientes/${c.id}`}>{c.email}</Link>
                </td>
                <td>{c.orders.length}</td>
                <td>{formatEuros(c.orders.reduce((sum, o) => sum + o.totalCents, 0))}</td>
                <td>{c.createdAt.toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4}>No hay clientes que coincidan.</td>
              </tr>
            )}
          </tbody>
        </table>

        {pageCount > 1 && (
          <div className="admin-pagination">
            {page > 1 && <Link href={`/admin/clientes?page=${page - 1}${q ? `&q=${q}` : ""}`}>← Anterior</Link>}
            <span>
              Página {page} de {pageCount}
            </span>
            {page < pageCount && <Link href={`/admin/clientes?page=${page + 1}${q ? `&q=${q}` : ""}`}>Siguiente →</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
