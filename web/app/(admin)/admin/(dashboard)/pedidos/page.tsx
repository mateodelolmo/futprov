import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatEuros } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

const PAGE_SIZE = 30;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as Prisma.OrderWhereInput["status"] } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { number: Number.isNaN(Number(q)) ? undefined : Number(q) },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (status) usp.set("status", status);
    Object.entries(params).forEach(([k, v]) => (v ? usp.set(k, v) : usp.delete(k)));
    return `/admin/pedidos?${usp.toString()}`;
  };

  return (
    <div>
      <h1>Pedidos</h1>

      <form className="admin-filters" action="/admin/pedidos">
        <input type="search" name="q" placeholder="Email o número de pedido" defaultValue={q} />
        <select name="status" defaultValue={status ?? ""}>
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="PAID">Pagado</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="FAILED">Fallido</option>
        </select>
        <button type="submit" className="admin-filters__submit">
          Filtrar
        </button>
      </form>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Importe</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/pedidos/${order.id}`}>#{order.number}</Link>
                </td>
                <td>{order.email}</td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td>{formatEuros(order.totalCents)}</td>
                <td>{order.createdAt.toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5}>No hay pedidos que coincidan con el filtro.</td>
              </tr>
            )}
          </tbody>
        </table>

        {pageCount > 1 && (
          <div className="admin-pagination">
            {page > 1 && <Link href={buildHref({ page: String(page - 1) })}>← Anterior</Link>}
            <span>
              Página {page} de {pageCount}
            </span>
            {page < pageCount && <Link href={buildHref({ page: String(page + 1) })}>Siguiente →</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
