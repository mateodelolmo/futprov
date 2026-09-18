import Image from "next/image";
import homeShowcase from "@/lib/home-showcase.json";

export function Showcase() {
  return (
    <div className="fp-section page-width" style={{ padding: "5rem 2rem" }}>
      <h2 className="title text-3xl font-display">Explora por liga</h2>
      <p className="fp-catalog__subheading">
        Un vistazo rápido al catálogo. Entra en cualquier liga para ver el resto.
      </p>

      <div className="fp-showcase" data-fp-inview>
        {homeShowcase.showcase.map((item, i) => (
          <a
            key={item.handle}
            href={`/catalogo?liga=${encodeURIComponent(item.league)}`}
            className={`fp-showcase__tile${i === 0 ? " fp-showcase__tile--big" : ""}`}
          >
            <Image
              src={item.src}
              alt={item.title}
              width={item.width}
              height={item.height}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="fp-showcase__label">
              <strong>{item.league}</strong>
              <span>{item.count.toLocaleString("es-ES")} camisetas</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
