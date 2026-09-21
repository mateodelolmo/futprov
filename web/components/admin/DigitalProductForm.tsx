"use client";

import { useActionState } from "react";
import type { DigitalProduct } from "@prisma/client";
import { updateDigitalProductAction } from "@/app/(admin)/admin/(dashboard)/digitales/actions";

export function DigitalProductForm({ product, canEdit }: { product: DigitalProduct; canEdit: boolean }) {
  const [error, formAction, pending] = useActionState(updateDigitalProductAction, undefined);

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="id" value={product.id} />

      <label>
        Título
        <input name="title" defaultValue={product.title} disabled={!canEdit} required />
      </label>

      <label>
        Descripción pública
        <textarea name="description" defaultValue={product.description ?? ""} disabled={!canEdit} />
      </label>

      <label>
        Precio (céntimos)
        <input type="number" name="priceCents" defaultValue={product.priceCents} disabled={!canEdit} min={0} required />
      </label>

      <label>
        Precio tachado (céntimos, opcional)
        <input type="number" name="compareAtCents" defaultValue={product.compareAtCents ?? ""} disabled={!canEdit} min={0} />
      </label>

      <label style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" name="active" defaultChecked={product.active} disabled={!canEdit} style={{ minHeight: "auto", width: "auto" }} />
        Activo
      </label>

      <label>
        Contacto de entrega (WhatsApp del proveedor — solo visible aquí y en la página de entrega)
        <textarea name="deliveryBody" defaultValue={product.deliveryBody ?? ""} disabled={!canEdit} rows={3} />
      </label>

      <label>
        Imagen de fondo (tarjeta en la tienda)
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.4rem" }}
          />
        )}
        <input type="file" name="image" accept="image/*" disabled={!canEdit} />
      </label>

      <label>
        PDF de entrega
        {product.fileKey && (
          <a href={product.fileKey} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: "0.4rem" }}>
            Ver PDF actual
          </a>
        )}
        <input type="file" name="pdf" accept="application/pdf" disabled={!canEdit} />
      </label>

      {error && (
        <p role="alert" style={{ color: "var(--admin-danger)", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}

      {canEdit && (
        <button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      )}
    </form>
  );
}
