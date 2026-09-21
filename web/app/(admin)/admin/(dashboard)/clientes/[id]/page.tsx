import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatEuros } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div>
      <Link href="/admin/clientes" className="admin-back-link">
        ← Clientes
      </Link>
      <h1>{customer.email}</h1>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Pedidos</div>
          <div className="admin-stat__value">{customer.orders.length}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Total gastado</div>
          <div className="admin-stat__value">{formatEuros(totalSpent)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Cliente desde</div>
          <div className="admin-stat__value" style={{ fontSize: "1.1rem" }}>
            {customer.createdAt.toLocaleDateString("es-ES")}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Historial de pedidos</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Estado</th>
              <th>Importe</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/pedidos/${order.id}`}>#{order.number}</Link>
                </td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td>{formatEuros(order.totalCents)}</td>
                <td>{order.createdAt.toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
