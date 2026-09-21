"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireEditableSession } from "@/lib/require-admin";

const schema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.coerce.number().int().min(0),
  compareAtCents: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  active: z.coerce.boolean().optional(),
  deliveryBody: z.string().optional(),
});

export async function updateDigitalProductAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  await requireEditableSession();

  const parsed = schema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceCents: formData.get("priceCents"),
    compareAtCents: formData.get("compareAtCents") || "",
    active: formData.get("active") === "on",
    deliveryBody: formData.get("deliveryBody") || undefined,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos.";
  }

  const { id, ...data } = parsed.data;
  const updates: typeof data & { imageUrl?: string; fileKey?: string } = { ...data };

  const image = formData.get("image");
  const pdf = formData.get("pdf");

  try {
    if (image instanceof File && image.size > 0) {
      const blob = await put(`digital-products/${id}/imagen-${Date.now()}-${image.name}`, image, {
        access: "public",
        addRandomSuffix: false,
      });
      updates.imageUrl = blob.url;
    }
    if (pdf instanceof File && pdf.size > 0) {
      const blob = await put(`digital-products/${id}/pdf-${Date.now()}-${pdf.name}`, pdf, {
        access: "public",
        addRandomSuffix: false,
      });
      updates.fileKey = blob.url;
    }
  } catch (err) {
    console.error(`[digitales] Fallo subiendo archivo para ${id}:`, err);
    return "No se pudo subir el archivo. Los demás cambios no se han guardado, inténtalo de nuevo.";
  }

  await db.digitalProduct.update({ where: { id }, data: updates });

  revalidatePath("/admin/digitales");
  revalidatePath("/");
  return undefined;
}
