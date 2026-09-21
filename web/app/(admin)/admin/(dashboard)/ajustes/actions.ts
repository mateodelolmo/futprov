"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireEditableSession } from "@/lib/require-admin";
import { SITE_SETTING_DEFAULTS } from "@/lib/site-settings";

const schema = z.object({
  offerbar_text: z.string().min(1),
  hero_headline: z.string().min(1),
});

export async function updateSiteSettingsAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  await requireEditableSession();

  const parsed = schema.safeParse({
    offerbar_text: formData.get("offerbar_text"),
    hero_headline: formData.get("hero_headline"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Datos inválidos.";

  await Promise.all(
    (Object.keys(SITE_SETTING_DEFAULTS) as (keyof typeof SITE_SETTING_DEFAULTS)[]).map((key) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value: parsed.data[key] },
        update: { value: parsed.data[key] },
      }),
    ),
  );

  revalidatePath("/admin/ajustes");
  revalidatePath("/");
  return undefined;
}
