// Lógica compartida de precios, tallas y clasificación de producto.
// Usada por build-import.mjs (fuente camisfutbol.shop) e import-yupoo.mjs (fuente Yupoo).

export const ADULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
export const KID_SIZES = ["16", "18", "20", "22", "24", "26", "28"];

// price = 17.95 + 2*(Player) + 2*(Con parche); compare_at = price + 5
export const FAN_PRICE = 17.95;
export const VERSION_SURCHARGE = 2;
export const PATCH_SURCHARGE = 2;
export const COMPARE_AT_MARGIN = 5;

export function priceFor(version, hasPatch) {
  const p = FAN_PRICE + (version === "Player" ? VERSION_SURCHARGE : 0) + (hasPatch ? PATCH_SURCHARGE : 0);
  return { price: p, compareAt: p + COMPARE_AT_MARGIN };
}

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export function isKid(title) {
  return /niñ|ni[oñ]|kids|set infantil|infantil|beb[eé]|conjunto/.test(title.toLowerCase());
}

export function deriveLeague(tags, title) {
  const joined = (tags || []).join("|").toLowerCase() + " " + title.toLowerCase();
  if (/retro/.test(joined)) return "Retro";
  if (/premier/.test(joined)) return "Premier League";
  if (/bundesliga/.test(joined)) return "Bundesliga";
  if (/ligue|champions/.test(joined)) return "Ligue 1";
  if (/serie.?a/.test(joined)) return "Serie A";
  if (/laliga|liga espa/.test(joined)) return "LaLiga";
  if (/tipo-seleccion|seleccion|mundial|euro/.test(joined)) return "Selecciones";
  if (/chandal|entrenamiento|cortaviento/.test(joined)) return "Chándal";
  if (/balon/.test(joined)) return "Balones";
  if (/mujer|femenin/.test(joined)) return "Mujer";
  if (/\bmls\b|major league soccer/.test(joined)) return "MLS";
  if (/liga ?mx/.test(joined)) return "Liga MX";
  if (/brasileir|brasileiro/.test(joined)) return "Brasileirão";
  if (/primeira liga|liga portugal|portu/.test(joined)) return "Primeira Liga";
  if (/eredivisie|holand|neerland/.test(joined)) return "Eredivisie";
  return "Otros";
}

export function deriveSeason(tags, title) {
  const joined = (tags || []).join("|") + " " + title;
  if (/retro/.test(joined.toLowerCase())) {
    if (/1980/.test(joined)) return "1980-1990";
    if (/1990/.test(joined)) return "1990-2000";
    if (/2000/.test(joined)) return "2000-2010";
    return "Retro";
  }
  if (/26-27/.test(joined)) return "2026-2027";
  if (/25-26/.test(joined)) return "2025-2026";
  if (/24-25/.test(joined)) return "2024-2025";
  return "Actual";
}

export function deriveKind(tags, title) {
  const joined = (tags || []).join("|").toLowerCase() + " " + title.toLowerCase();
  if (/retro/.test(joined)) return "Camiseta Retro";
  if (/chandal|entrenamiento|cortaviento/.test(joined)) return "Chándal";
  if (/balon/.test(joined)) return "Balón";
  return "Camiseta";
}

// hasVersion: si el producto lleva la 3ª opción Versión (Fan/Player). Solo camisetas.
export function buildVariants(sizes, hasVersion) {
  const variants = [];
  for (const size of sizes) {
    for (const patchLabel of ["Sin parche", "Con parche"]) {
      const hasPatch = patchLabel === "Con parche";
      if (hasVersion) {
        for (const version of ["Fan", "Player"]) {
          const { price, compareAt } = priceFor(version, hasPatch);
          variants.push({
            title: `${size} / ${patchLabel} / ${version}`,
            price,
            compareAtPrice: compareAt,
            option1: size,
            option2: patchLabel,
            option3: version,
          });
        }
      } else {
        const { price, compareAt } = priceFor("Fan", hasPatch);
        variants.push({
          title: `${size} / ${patchLabel}`,
          price,
          compareAtPrice: compareAt,
          option1: size,
          option2: patchLabel,
        });
      }
    }
  }
  return variants;
}

export function buildOptions(sizes, hasVersion) {
  return hasVersion
    ? [
        { name: "Talla", values: sizes },
        { name: "Parche", values: ["Sin parche", "Con parche"] },
        { name: "Versión", values: ["Fan", "Player"] },
      ]
    : [
        { name: "Talla", values: sizes },
        { name: "Parche", values: ["Sin parche", "Con parche"] },
      ];
}
