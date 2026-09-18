import { Fragment } from "react";

const LEAGUES = ["LaLiga", "Premier League", "Bundesliga", "Ligue 1", "Retro", "Selecciones"];

export function Hero() {
  return (
    <div className="fp-section fp-hero">
      <div className="page-width">
        <div className="fp-hero__content">
          <span className="fp-hero__eyebrow">El catálogo más completo de camisetas</span>
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

        <div className="fp-marquee">
          <div className="fp-marquee__track" aria-hidden="true">
            {[0, 1].map((rep) => (
              <Fragment key={rep}>
                {LEAGUES.map((item) => (
                  <span key={`${rep}-${item}`}>{item}</span>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
