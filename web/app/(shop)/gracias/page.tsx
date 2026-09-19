import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/orders";
import { ClearCartOnMount } from "@/components/shop/ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <main className="page-width" style={{ padding: "6rem 2rem", maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
        <h1 className="text-3xl font-display mb-2">Pedido no encontrado</h1>
        <Link href="/#proveedores" className="button" style={{ marginTop: "2rem" }}>Volver a proveedores</Link>
      </main>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return (
      <main className="page-width" style={{ padding: "6rem 2rem", maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
        <h1 className="text-3xl font-display mb-2">Pago pendiente</h1>
        <p style={{ opacity: 0.7 }}>Si acabas de pagar, recarga esta página en unos segundos.</p>
      </main>
    );
  }

  const order = await fulfillCheckoutSession(session);

  return (
    <main className="page-width" style={{ padding: "6rem 2rem", maxWidth: "40rem", margin: "0 auto", textAlign: "center" }}>
      <ClearCartOnMount />
      <h1 className="text-3xl font-display mb-2">¡Pago confirmado!</h1>
      <p style={{ opacity: 0.7, marginBottom: "2.4rem" }}>
        Aquí tienes {order && order.deliveries.length > 1 ? "tus accesos" : "tu acceso"}. Guarda
        {order && order.deliveries.length > 1 ? " estos enlaces, también válidos" : " este enlace, también válido"} durante 30 días desde tu email si lo añadimos.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {order?.deliveries.map((delivery) => (
          <Link key={delivery.id} href={`/entrega/${delivery.token}`} className="button">
            Ver mi acceso
          </Link>
        ))}
      </div>
    </main>
  );
}
