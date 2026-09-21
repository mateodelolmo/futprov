import { getCatalogStats } from "@/lib/catalog";

export async function Hero({ headline }: { headline?: string }) {
  const { productCount, leagueCount } = await getCatalogStats();
  const words = (headline ?? "EL CONTACTO DEL PROVEEDOR").split(" ");
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");

  return (
    <div className="fp-section fp-hero fp-hero--solo">
      <div className="page-width">
        <div className="fp-hero__content">
          <span className="fp-hero__eyebrow">
            Acceso directo · sin intermediarios · entrega al instante
          </span>
          <h1 className="fp-hero__title">
            <span>{line1}</span>
            {line2 && <span>{line2}</span>}
          </h1>
          <p className="fp-hero__subtitle">
            Consigue el WhatsApp directo del proveedor de ropa, perfumes o vapes y pide tú mismo
            lo que quieras, al precio de fábrica. Explora antes {productCount.toLocaleString("es-ES")}{" "}
            referencias de camisetas de {leagueCount} ligas y selecciones para saber qué pedir.
          </p>
          <div className="fp-hero__ctas">
            <a href="#proveedores" className="button">
              Comprar acceso ahora
            </a>
            <a href="/catalogo" className="button button--secondary">
              Ver catálogo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
