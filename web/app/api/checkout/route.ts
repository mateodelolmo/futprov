import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDigitalProductByHandle } from "@/lib/digital-products";

export async function POST(req: NextRequest) {
  const { handle } = await req.json();
  const product = handle ? await getDigitalProductByHandle(handle) : null;
  if (!product || !product.active) {
    return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: product.priceCents,
          product_data: { name: product.title },
        },
        quantity: 1,
      },
    ],
    metadata: { digitalProductId: product.id },
    success_url: `${origin}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/proveedores/${product.handle}`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "No se pudo crear la sesion de pago" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
