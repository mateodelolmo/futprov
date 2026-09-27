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
    <main className="page-width fp-pdp">
      <div className="fp-pdp__media">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt={product.title} />
        )}
      </div>

      <div>
        <h1 className="text-3xl font-display mb-2">{product.title}</h1>
        <p className="fp-pdp__meta">
          {[product.league, product.season].filter(Boolean).join(" · ")}
        </p>

        {product.sizes.length > 0 && (
          <div className="fp-pdp__sizes-wrap">
            <p className="fp-pdp__sizes-label">Tallas disponibles</p>
            <div className="fp-pdp__sizes">
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
            className="fp-pdp__desc"
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
