import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDigitalProductByHandle } from "@/lib/digital-products";
import { BuyButton } from "@/components/shop/BuyButton";

export const revalidate = 3600;

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getDigitalProductByHandle(handle);
  if (!product) return {};
  return { title: `${product.title} · Fut Prov` };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getDigitalProductByHandle(handle);
  if (!product || !product.active) notFound();

  return (
    <main className="page-width" style={{ padding: "4rem 2rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h1 className="text-3xl font-display mb-2">{product.title}</h1>
      <div className="fp-provider-card__price" style={{ marginBottom: "1.6rem" }}>
        {formatPrice(product.priceCents)}
        {product.compareAtCents && (
          <span
            style={{
              marginLeft: "0.6rem",
              fontSize: "1.3rem",
              opacity: 0.5,
              textDecoration: "line-through",
              fontWeight: 400,
            }}
          >
            {formatPrice(product.compareAtCents)}
          </span>
        )}
      </div>

      {product.description && (
        <div
          style={{ fontSize: "1.4rem", lineHeight: 1.6, opacity: 0.85, marginBottom: "2rem" }}
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}

      <BuyButton
        handle={product.handle}
        className="button button--full-width button--primary"
        label={`Comprar acceso — ${formatPrice(product.priceCents)}`}
      />
    </main>
  );
}
