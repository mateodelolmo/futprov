import { getActiveDigitalProducts } from "@/lib/digital-products";
import { formatPrice } from "@/lib/format";
import { BuyButton } from "./BuyButton";
import { PaymentMethods } from "./PaymentMethods";

const FEATURES: Record<string, string[]> = {
  "proveedor-ropa": ["Contacto directo por WhatsApp", "Catálogo completo de ropa", "Entrega instantánea"],
  "proveedor-perfumes": ["Contacto directo por WhatsApp", "Catálogo completo de perfumes", "Entrega instantánea"],
  "proveedor-vapes": ["Contacto directo por WhatsApp", "Catálogo completo de vapes", "Entrega instantánea"],
  "proveedor-pack-3": ["Los 4 contactos en un pack", "Camisetas, ropa, perfumes y vapes", "Ahorra frente a comprar por separado", "Entrega instantánea"],
  "guia-digital-pdf": ["Guía en PDF", "Entrega instantánea por email"],
};

const FEATURED_HANDLE = "proveedor-pack-3";

const PHOTOS: Record<string, string> = {
  "proveedor-ropa": "/providers/ropa.png",
  "proveedor-perfumes": "/providers/perfumes.png",
  "proveedor-vapes": "/providers/vapes.png",
  "guia-digital-pdf": "/providers/camisetas.webp",
  "proveedor-pack-3": "/providers/pack.webp",
};

export async function ProvidersGrid() {
  const products = await getActiveDigitalProducts();

  return (
    <div id="proveedores" className="fp-section fp-section--pad page-width">
      <span className="fp-kicker">Proveedores</span>
      <h2 className="title text-3xl font-display">Accesos a proveedores</h2>
      <p className="fp-catalog__subheading">
        Elige el pack que necesites y consigue el contacto al instante.
      </p>

      <div className="fp-pricing">
        {products.map((product, i) => {
          const featured = product.handle === FEATURED_HANDLE;
          const discountPct =
            product.compareAtCents && product.compareAtCents > product.priceCents
              ? Math.round((1 - product.priceCents / product.compareAtCents) * 100)
              : null;
          return (
            <div
              key={product.id}
              data-fp-inview
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`fp-pricing__card${featured ? " fp-pricing__card--featured" : ""}`}
            >
              {(product.imageUrl || PHOTOS[product.handle]) && (
                <div className="fp-pricing__image">
                  {featured && <span className="fp-pricing__badge">Más popular</span>}
                  {discountPct && (
                    <span className="fp-pricing__badge fp-pricing__badge--sale">
                      OFERTA -{discountPct}%
                    </span>
                  )}
                  <img src={product.imageUrl || PHOTOS[product.handle]} alt="" />
                </div>
              )}
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
              <BuyButton
                handle={product.handle}
                className={`button button--full-width ${featured ? "button--primary" : "button--secondary"}`}
                label="Conseguir acceso"
              />
              <PaymentMethods className="fp-pricing__payments" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
