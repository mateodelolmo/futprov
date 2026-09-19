import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const bodySchema = z.union([
  z.object({ handles: z.array(z.string()).min(1).max(5) }),
  z.object({ handle: z.string() }),
]);

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }
  const handles = "handles" in parsed.data ? [...new Set(parsed.data.handles)] : [parsed.data.handle];

  const products = await db.digitalProduct.findMany({
    where: { handle: { in: handles }, active: true },
  });
  if (products.length === 0) {
    return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: products.map((product) => ({
      price_data: {
        currency: "eur",
        unit_amount: product.priceCents,
        product_data: { name: product.title },
      },
      quantity: 1,
    })),
    metadata: { digitalProductIds: JSON.stringify(products.map((p) => p.id)) },
    success_url: `${origin}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "No se pudo crear la sesion de pago" }, { status: 502 });
  }
  return NextResponse.json({ url: session.url });
}
