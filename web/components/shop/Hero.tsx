import { Fragment } from "react";
import Image from "next/image";
import { getCatalogStats } from "@/lib/catalog";
import homeShowcase from "@/lib/home-showcase.json";

export async function Hero() {
  const { productCount, leagueCount } = await getCatalogStats();
  const strip = homeShowcase.strip;

  return (
    <div className="fp-section fp-hero">
      <div className="page-width">
        <div className="fp-hero__content">
          <span className="fp-hero__eyebrow">
            {productCount.toLocaleString("es-ES")} camisetas · {leagueCount} ligas y selecciones
          </span>
          <h1 className="fp-hero__title">
            <span>CONSIGUE EL ACCESO</span>
            <span>AL PROVEEDOR</span>
          </h1>
          <p className="fp-hero__subtitle">
            Explora el catálogo de camisetas de todas las ligas y hazte con el contacto directo
            del proveedor para pedir la que quieras.
          </p>
          <div className="fp-hero__ctas">
            <a href="/catalogo" className="button">
              Ver catálogo
            </a>
            <a href="#proveedores" className="button button--secondary">
              Comprar contacto proveedor
            </a>
          </div>
        </div>

        <div className="fp-photostrip" aria-hidden="true">
          <div className="fp-photostrip__track">
            {[0, 1].map((rep) => (
              <Fragment key={rep}>
                {strip.map((item, i) => (
                  <div key={`${rep}-${item.handle}`} className="fp-photostrip__item">
                    <Image
                      src={item.src}
                      alt=""
                      width={item.width}
                      height={item.height}
                      loading={rep === 0 && i < 4 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
