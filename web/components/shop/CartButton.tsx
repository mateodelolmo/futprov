"use client";

import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { count, setOpen } = useCart();

  return (
    <button
      type="button"
      className="fp-cart-button"
      onClick={() => setOpen(true)}
      aria-label={`Abrir carrito${count > 0 ? `, ${count} producto${count === 1 ? "" : "s"}` : ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.2 11h11.1L20 8H6.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
      </svg>
      {count > 0 && <span className="fp-cart-button__badge">{count}</span>}
    </button>
  );
}
