"use client";

import { useState, useTransition } from "react";
import { refundOrderAction, resendDeliveryEmailAction } from "@/app/(admin)/admin/(dashboard)/pedidos/[id]/actions";

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleRefund() {
    if (!confirm("¿Reembolsar este pedido? Esta acción se hace directamente en Stripe y no se puede deshacer.")) return;
    startTransition(async () => {
      try {
        await refundOrderAction(orderId);
        setMessage("Reembolso solicitado.");
      } catch (err) {
        setMessage((err as Error).message);
      }
    });
  }

  function handleResend() {
    startTransition(async () => {
      try {
        await resendDeliveryEmailAction(orderId);
        setMessage("Email reenviado.");
      } catch (err) {
        setMessage((err as Error).message);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <button type="button" onClick={handleResend} disabled={pending} className="admin-filters__submit">
        Reenviar email de entrega
      </button>
      {status !== "REFUNDED" && (
        <button
          type="button"
          onClick={handleRefund}
          disabled={pending}
          className="admin-filters__submit"
          style={{ color: "var(--admin-danger)", borderColor: "var(--admin-danger)" }}
        >
          Reembolsar
        </button>
      )}
      {message && <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)" }}>{message}</p>}
    </div>
  );
}
