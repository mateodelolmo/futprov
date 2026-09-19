"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { items, products, remove, totalCents, open, setOpen } = useCart();
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles: items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "No se pudo iniciar el pago");
        setLoading(false);
      }
    } catch {
      alert("No se pudo iniciar el pago");
      setLoading(false);
    }
  }

  return (
    <div className="fp-cart-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="fp-cart-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Carrito">
        <div className="fp-cart-panel__header">
          <h2>Tu carrito</h2>
          <button ref={closeRef} type="button" className="fp-cart-panel__close" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="fp-cart-panel__empty">Aún no has añadido ningún acceso.</p>
        ) : (
          <ul className="fp-cart-panel__list">
            {items.map((handle) => {
              const product = products.find((p) => p.handle === handle);
              if (!product) return null;
              return (
                <li key={handle} className="fp-cart-panel__item">
                  <div>
                    <p className="fp-cart-panel__item-title">{product.title}</p>
                    <p className="fp-cart-panel__item-price">{formatPrice(product.priceCents)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(handle)}
                    aria-label={`Quitar ${product.title} del carrito`}
                    className="fp-cart-panel__remove"
                  >
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="fp-cart-panel__footer">
            <div className="fp-cart-panel__total">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <button type="button" className="button button--primary button--full-width" onClick={checkout} disabled={loading}>
              {loading ? "Redirigiendo…" : "Pagar con Stripe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
