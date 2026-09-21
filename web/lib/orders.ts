import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { db } from "./db";
import { sendDeliveryEmail } from "./mail";

const DELIVERY_DAYS = 30;

function productIdsFromMetadata(session: Stripe.Checkout.Session): string[] {
  const list = session.metadata?.digitalProductIds;
  if (list) {
    try {
      const ids = JSON.parse(list);
      if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) return ids;
    } catch {
      // metadata corrupta, cae al fallback
    }
  }
  const single = session.metadata?.digitalProductId;
  return single ? [single] : [];
}

// Idempotente: puede llamarse desde el webhook y desde la pagina de gracias
// sin duplicar el pedido (Order.stripeSessionId es unico).
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return null;

  const existing = await db.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { deliveries: true, items: true },
  });
  if (existing) return existing;

  const digitalProductIds = productIdsFromMetadata(session);
  if (digitalProductIds.length === 0) throw new Error(`Sesion ${session.id} sin productos en metadata`);

  const products = await db.digitalProduct.findMany({ where: { id: { in: digitalProductIds } } });
  if (products.length === 0) throw new Error(`Ningun DigitalProduct encontrado para sesion ${session.id}`);

  const email = session.customer_details?.email ?? session.customer_email ?? "";

  let customer = email ? await db.customer.findUnique({ where: { email } }) : null;
  if (email && !customer) {
    customer = await db.customer.create({ data: { email } });
  }

  try {
    const order = await db.order.create({
      data: {
        customerId: customer?.id,
        email,
        status: "PAID",
        totalCents: session.amount_total ?? products.reduce((sum, p) => sum + p.priceCents, 0),
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        paidAt: new Date(),
        items: {
          create: products.map((product) => ({
            digitalProductId: product.id,
            titleSnapshot: product.title,
            unitCents: product.priceCents,
          })),
        },
        deliveries: {
          create: products.map((product) => ({
            digitalProductId: product.id,
            token: randomBytes(24).toString("hex"),
            expiresAt: new Date(Date.now() + DELIVERY_DAYS * 24 * 60 * 60 * 1000),
          })),
        },
      },
      include: { deliveries: { include: { digitalProduct: true } }, items: true },
    });
    await sendDeliveryEmail(order);
    return order;
  } catch (err) {
    // Carrera: otra llamada (webhook vs pagina de gracias) ya lo creo entre el find y el create.
    const raceWinner = await db.order.findUnique({
      where: { stripeSessionId: session.id },
      include: { deliveries: true, items: true },
    });
    if (raceWinner) return raceWinner;
    throw err;
  }
}
