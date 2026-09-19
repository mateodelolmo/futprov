"use client";

import { useCart } from "@/lib/cart-context";

export function BuyButton({ handle, className, label }: { handle: string; className: string; label: string }) {
  const { add, has, setOpen } = useCart();
  const inCart = has(handle);

  function onClick() {
    if (inCart) return;
    add(handle);
    setOpen(true);
  }

  return (
    <button type="button" onClick={onClick} disabled={inCart} className={className} aria-pressed={inCart}>
      {inCart ? "En el carrito ✓" : label}
    </button>
  );
}
