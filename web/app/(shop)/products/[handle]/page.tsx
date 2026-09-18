import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle } from "@/lib/catalog";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};
  return {
    title: `${product.title} · Fut Prov`,
    description: product.description?.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product || !product.active) notFound();

  return (
    <main className="page-width" style={{ padding: "3rem 2rem", display: "grid", gap: "3rem", gridTemplateColumns: "1fr 1fr" }}>
      <div className="fp-catalog__grid" style={{ gridTemplateColumns: "1fr" }}>
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0].url}
            alt={product.title}
            style={{ width: "100%", borderRadius: "1rem", aspectRatio: "3 / 4", objectFit: "cover" }}
          />
        )}
      </div>

      <div>
        <h1 className="text-3xl font-display mb-2">{product.title}</h1>
        <p style={{ opacity: 0.6, marginBottom: "1.2rem" }}>
          {[product.league, product.season].filter(Boolean).join(" · ")}
        </p>

        {product.sizes.length > 0 && (
          <div style={{ marginBottom: "1.6rem" }}>
            <p style={{ fontSize: "1.3rem", opacity: 0.6, marginBottom: "0.6rem" }}>
              Tallas disponibles
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {product.sizes.map((size) => (
                <span key={size} className="fp-chip" style={{ cursor: "default" }}>
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div
            style={{ fontSize: "1.4rem", lineHeight: 1.6, opacity: 0.85, marginBottom: "1.6rem" }}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        <div className="fp-showcase-cta">
          <p className="fp-showcase-cta__note">
            Esta camiseta no se vende directamente aquí. Consigue acceso al proveedor para
            pedirla.
          </p>
          <a href="/#proveedores" className="button button--full-width button--primary">
            Consigue el contacto del proveedor
          </a>
        </div>
      </div>
    </main>
  );
}
