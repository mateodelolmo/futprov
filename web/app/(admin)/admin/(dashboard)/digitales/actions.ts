"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  await db.digitalProduct.update({ where: { id }, data });

  revalidatePath("/admin/digitales");
  return undefined;
}
