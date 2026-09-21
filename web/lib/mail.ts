import { Resend } from "resend";
import { DeliveryEmail } from "@/emails/DeliveryEmail";

type OrderForEmail = {
  number: number;
  email: string;
  deliveries: { token: string; digitalProduct: { title: string } }[];
};

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "https://futprov.vercel.app";
}

// Una compra nunca debe fallar porque el email no salga: si no hay
// RESEND_API_KEY (pendiente de que el usuario cree su cuenta), se registra
// un aviso y no se lanza ningún error.
export async function sendDeliveryEmail(order: OrderForEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[mail] RESEND_API_KEY no configurada: no se envía email para el pedido #${order.number}`);
    return;
  }
  if (!order.email) {
    console.warn(`[mail] Pedido #${order.number} sin email, no se envía`);
    return;
  }

  const resend = new Resend(apiKey);
  const base = siteUrl();

  try {
    await resend.emails.send({
      // Resend exige un dominio verificado para el remitente; hasta que se
      // verifique uno propio (ver README), se usa el dominio de pruebas.
      from: process.env.RESEND_FROM_EMAIL ?? "Fut Prov <onboarding@resend.dev>",
      to: order.email,
      subject: `Tus accesos del pedido #${order.number}`,
      react: DeliveryEmail({
        orderNumber: order.number,
        items: order.deliveries.map((d) => ({
          title: d.digitalProduct.title,
          deliveryUrl: `${base}/entrega/${d.token}`,
        })),
      }),
    });
  } catch (err) {
    console.error(`[mail] Fallo enviando email del pedido #${order.number}:`, err);
  }
}
