import { db } from "./db";

export const SITE_SETTING_DEFAULTS = {
  offerbar_text: "¡Oferta especial solo hoy! Acceso al proveedor con descuento. Termina en:",
  hero_headline: "EL CONTACTO DEL PROVEEDOR",
} as const;

export type SiteSettingKey = keyof typeof SITE_SETTING_DEFAULTS;

export async function getSiteSettings(): Promise<Record<SiteSettingKey, string>> {
  const rows = await db.siteSetting.findMany({
    where: { key: { in: Object.keys(SITE_SETTING_DEFAULTS) } },
  });
  const values = { ...SITE_SETTING_DEFAULTS } as Record<SiteSettingKey, string>;
  for (const row of rows) {
    if (typeof row.value === "string") values[row.key as SiteSettingKey] = row.value;
  }
  return values;
}
