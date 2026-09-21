"use client";

import { useTransition } from "react";
import { extendDeliveryAction } from "@/app/(admin)/admin/(dashboard)/pedidos/[id]/actions";

export function ExtendDeliveryButton({ deliveryId }: { deliveryId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => extendDeliveryAction(deliveryId))}
      className="admin-filters__submit"
    >
      +30 días
    </button>
  );
}
