"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fp-mobile-nav">
      <button
        type="button"
        className="fp-mobile-nav__toggle"
        aria-expanded={open}
        aria-controls="fp-mobile-nav-panel"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div id="fp-mobile-nav-panel" className="fp-mobile-nav__panel">
          <Link href="/catalogo" onClick={() => setOpen(false)}>
            Catálogo
          </Link>
          <Link href="/#proveedores" onClick={() => setOpen(false)}>
            Proveedores
          </Link>
        </div>
      )}
    </div>
  );
}
