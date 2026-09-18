import { getCatalogStats } from "@/lib/catalog";

export async function Trust() {
  const { productCount, leagueCount } = await getCatalogStats();

  return (
    <div className="fp-section page-width" style={{ padding: "4rem 2rem" }}>
      <div className="fp-trust">
        <div className="fp-trust__item">
          <div className="fp-trust__num" data-fp-counter={productCount}>
            0
          </div>
          <p>camisetas en catálogo</p>
        </div>
        <div className="fp-trust__item">
          <div className="fp-trust__num" data-fp-counter={leagueCount}>
            0
          </div>
          <p>ligas y selecciones</p>
        </div>
      </div>
    </div>
  );
}
