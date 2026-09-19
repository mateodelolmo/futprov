import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { db } from "./db";

const DELIVERY_DAYS = 30;

// Idempotente: puede llamarse desde el webhook y desde la pagina de gracias
// sin duplicar el pedido (Order.stripeSessionId es unico).
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return null;

  const existing = await db.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { deliveries: true, items: true },
  });
  if (existing) return existing;

  const digitalProductId = session.metadata?.digitalProductId;
  if (!digitalProductId) throw new Error(`Sesion ${session.id} sin metadata.digitalProductId`);

  const product = await db.digitalProduct.findUnique({ where: { id: digitalProductId } });
  if (!product) throw new Error(`DigitalProduct ${digitalProductId} no existe`);

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
        totalCents: session.amount_total ?? product.priceCents,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        paidAt: new Date(),
        items: {
          create: {
            digitalProductId: product.id,
            titleSnapshot: product.title,
            unitCents: product.priceCents,
          },
        },
        deliveries: {
          create: {
            digitalProductId: product.id,
            token: randomBytes(24).toString("hex"),
            expiresAt: new Date(Date.now() + DELIVERY_DAYS * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { deliveries: true, items: true },
    });
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
