"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { requireEditableSession } from "@/lib/require-admin";
import { sendDeliveryEmail } from "@/lib/mail";

export async function refundOrderAction(orderId: string) {
  await requireEditableSession();

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (!order.stripePaymentIntentId) throw new Error("Este pedido no tiene pago asociado en Stripe.");
  if (order.status === "REFUNDED") return;

  await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
  // El estado se actualiza a REFUNDED vía el webhook charge.refunded para no
  // duplicar la lógica de idempotencia que ya vive en el webhook.

  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function resendDeliveryEmailAction(orderId: string) {
  await requireEditableSession();

  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { deliveries: { include: { digitalProduct: true } }, items: true },
  });
  if (!order.email) throw new Error("El pedido no tiene email.");

  await sendDeliveryEmail(order);
  await db.delivery.updateMany({ where: { orderId }, data: { lastSentAt: new Date() } });

  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function extendDeliveryAction(deliveryId: string) {
  await requireEditableSession();

  const delivery = await db.delivery.findUniqueOrThrow({ where: { id: deliveryId } });
  const base = delivery.expiresAt > new Date() ? delivery.expiresAt : new Date();
  const newExpiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

  await db.delivery.update({ where: { id: deliveryId }, data: { expiresAt: newExpiry } });

  revalidatePath(`/admin/pedidos/${delivery.orderId}`);
}
