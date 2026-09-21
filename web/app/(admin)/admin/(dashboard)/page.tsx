import Link from "next/link";
import { db } from "@/lib/db";
import { formatEuros } from "@/lib/money";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

function startOfDay(daysAgo: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

async function getStats() {
  const [today, last7, last30, ordersLast30, recentOrders] = await Promise.all([
    db.order.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfDay(0) } },
      _sum: { totalCents: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfDay(6) } },
      _sum: { totalCents: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfDay(29) } },
      _sum: { totalCents: true },
      _count: true,
    }),
    db.order.findMany({
      where: { status: "PAID", paidAt: { gte: startOfDay(29) } },
      select: { totalCents: true, paidAt: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: true },
    }),
  ]);

  const dayBuckets: number[] = Array.from({ length: 30 }, () => 0);
  for (const order of ordersLast30) {
    if (!order.paidAt) continue;
    const daysAgo = Math.floor((Date.now() - order.paidAt.getTime()) / (24 * 60 * 60 * 1000));
    const index = 29 - daysAgo;
    if (index >= 0 && index < 30) dayBuckets[index] += order.totalCents;
  }

  return { today, last7, last30, dayBuckets, recentOrders };
}

export default async function AdminDashboardPage() {
  const { today, last7, last30, dayBuckets, recentOrders } = await getStats();
  const avgTicket = last30._count > 0 ? Math.round((last30._sum.totalCents ?? 0) / last30._count) : 0;

  return (
    <div>
      <h1>Resumen</h1>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Ingresos hoy</div>
          <div className="admin-stat__value">{formatEuros(today._sum.totalCents ?? 0)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Ingresos 7 días</div>
          <div className="admin-stat__value">{formatEuros(last7._sum.totalCents ?? 0)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Ingresos 30 días</div>
          <div className="admin-stat__value">{formatEuros(last30._sum.totalCents ?? 0)}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Pedidos 30 días</div>
          <div className="admin-stat__value">{last30._count}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Ticket medio</div>
          <div className="admin-stat__value">{formatEuros(avgTicket)}</div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Últimos 30 días</h2>
        <RevenueChart data={dayBuckets} />
      </div>

      <div className="admin-panel">
        <h2>Últimos pedidos</h2>
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
            {recentOrders.map((order) => (
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
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5}>Todavía no hay pedidos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
