"use client";

import { useState } from "react";

export function BuyButton({ handle, className, label }: { handle: string; className: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
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
    <button type="button" onClick={buy} disabled={loading} className={className}>
      {loading ? "Redirigiendo…" : label}
    </button>
  );
}
