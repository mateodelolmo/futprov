import { getActiveDigitalProducts } from "@/lib/digital-products";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export async function ProvidersGrid() {
  const products = await getActiveDigitalProducts();

  return (
    <div id="proveedores" className="fp-section page-width" style={{ padding: "5rem 2rem" }}>
      <h2 className="title text-3xl font-display">Accesos a proveedores</h2>
      <p className="fp-catalog__subheading">
        Elige el pack que necesites y consigue el contacto al instante.
      </p>

      <div className="fp-providers">
        {products.map((product) => (
          <div key={product.id} className="fp-provider-card">
            <a href={`/proveedores/${product.handle}`} className="fp-provider-card__title">
              {product.title}
            </a>
            <div className="fp-provider-card__stars" aria-hidden="true">
              ★★★★★
            </div>
            <div className="fp-provider-card__price">
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
            <a
              href={`/proveedores/${product.handle}`}
              className="button button--full-width button--primary"
            >
              Conseguir acceso
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
