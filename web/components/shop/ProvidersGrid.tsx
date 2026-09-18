import { getActiveDigitalProducts } from "@/lib/digital-products";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

const FEATURES: Record<string, string[]> = {
  "proveedor-ropa": ["Contacto directo por WhatsApp", "Catálogo completo de ropa", "Entrega instantánea"],
  "proveedor-perfumes": ["Contacto directo por WhatsApp", "Catálogo completo de perfumes", "Entrega instantánea"],
  "proveedor-vapes": ["Contacto directo por WhatsApp", "Catálogo completo de vapes", "Entrega instantánea"],
  "proveedor-pack-3": ["Los 4 contactos en un pack", "Camisetas, ropa, perfumes y vapes", "Ahorra frente a comprar por separado", "Entrega instantánea"],
  "guia-digital-pdf": ["Guía en PDF", "Entrega instantánea por email"],
};

const FEATURED_HANDLE = "proveedor-pack-3";

export async function ProvidersGrid() {
  const products = await getActiveDigitalProducts();

  return (
    <div id="proveedores" className="fp-section page-width" style={{ padding: "5rem 2rem" }}>
      <h2 className="title text-3xl font-display">Accesos a proveedores</h2>
      <p className="fp-catalog__subheading">
        Elige el pack que necesites y consigue el contacto al instante.
      </p>

      <div className="fp-pricing" data-fp-inview>
        {products.map((product) => {
          const featured = product.handle === FEATURED_HANDLE;
          return (
            <div key={product.id} className={`fp-pricing__card${featured ? " fp-pricing__card--featured" : ""}`}>
              {featured && <span className="fp-pricing__badge">Más popular</span>}
              <h3 className="fp-pricing__title">{product.title}</h3>
              <div className="fp-pricing__price">
                {formatPrice(product.priceCents)}
                {product.compareAtCents && (
                  <span className="fp-pricing__compare">{formatPrice(product.compareAtCents)}</span>
                )}
              </div>
              <ul className="fp-pricing__features">
                {(FEATURES[product.handle] ?? []).map((f) => (
                  <li key={f}>
                    <span aria-hidden="true">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={`/proveedores/${product.handle}`}
                className={`button button--full-width ${featured ? "button--primary" : "button--secondary"}`}
              >
                Conseguir acceso
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
