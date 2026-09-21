import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatEuros } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { auth } from "@/lib/auth";
import { canEditCrm } from "@/lib/allowed-admins";
import { OrderActions } from "@/components/admin/OrderActions";
import { ExtendDeliveryButton } from "@/components/admin/ExtendDeliveryButton";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, session] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { digitalProduct: true } },
        deliveries: { include: { digitalProduct: true } },
      },
    }),
    auth(),
  ]);
  if (!order) notFound();

  const canEdit = session?.user ? canEditCrm(session.user.role) : false;

  return (
    <div>
      <Link href="/admin/pedidos" className="admin-back-link">
        ← Pedidos
      </Link>
      <h1>
        Pedido #{order.number} <OrderStatusBadge status={order.status} />
      </h1>

      <div className="admin-detail-grid">
        <div>
          <div className="admin-panel">
            <h2>Líneas</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titleSnapshot}</td>
                    <td>{formatEuros(item.unitCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: "1rem", fontWeight: 600 }}>Total: {formatEuros(order.totalCents)}</p>
          </div>

          <div className="admin-panel">
            <h2>Entregas</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Token</th>
                  <th>Caduca</th>
                  <th>Descargas</th>
                  <th>Enviado</th>
                  {canEdit && <th></th>}
                </tr>
              </thead>
              <tbody>
                {order.deliveries.map((d) => (
                  <tr key={d.id}>
                    <td>{d.digitalProduct.title}</td>
                    <td>
                      <Link href={`/entrega/${d.token}`} target="_blank">
                        {d.token.slice(0, 10)}…
                      </Link>
                    </td>
                    <td>{d.expiresAt.toLocaleDateString("es-ES")}</td>
                    <td>{d.downloadCount}</td>
                    <td>{d.lastSentAt ? d.lastSentAt.toLocaleDateString("es-ES") : "—"}</td>
                    {canEdit && (
                      <td>
                        <ExtendDeliveryButton deliveryId={d.id} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="admin-panel">
            <h2>Cliente</h2>
            <p>{order.email}</p>
            {order.customer && (
              <Link href={`/admin/clientes/${order.customer.id}`} className="admin-back-link">
                Ver historial de compras →
              </Link>
            )}
          </div>

          <div className="admin-panel">
            <h2>Stripe</h2>
            {order.stripeSessionId && (
              <p>
                <a
                  href={`https://dashboard.stripe.com/test/payments?query=${order.stripeSessionId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Sesión de checkout →
                </a>
              </p>
            )}
            {order.stripePaymentIntentId && (
              <p>
                <a
                  href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pago →
                </a>
              </p>
            )}
          </div>

          {canEdit && (
            <div className="admin-panel">
              <h2>Acciones</h2>
              <OrderActions orderId={order.id} status={order.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
