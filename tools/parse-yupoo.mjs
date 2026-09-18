// Convierte un título sucio de álbum Yupoo en datos de producto estructurados
// (temporada, equipo, tipo de equipación, adulto/niño/mujer) y en un título en español
// con la misma convención que ya usa la tienda ("26-27 Real Madrid primera equipación").
import { normalizeText, findTeamKey } from "./lib/teams.mjs";

// Ruido a quitar del título (temporada/talla ya fuera) para que lo que sobra sea el
// nombre del equipo. Cubre ES (tienda) e EN (Yupoo).
const NOISE_RE =
  /\b(player'?s?|players?|women'?s?|woman|kids?|child(ren)?|ni[ñn]o|ni[ñn]a|mujer|home|away|third|second|fourth|first|primera|segunda|tercera|cuarta|equipacion|game|jersey|camiseta|soccer|shirt|uniform|edition|special|especial|long[- ]sleeved?|manga larga|goalkeeper|portero|training|entrenamiento|kit|set|conjunto|pre[- ]?match|pre[- ]?race|at home|team|world cup|mundial|adult|adulto|polo|windbreaker|coat|vintage|classic|casual|retro|the|of|and|de|del|la|el)\b/gi;

function extractTeamText(withoutSizes) {
  return withoutSizes.replace(NOISE_RE, " ").replace(/\s+/g, " ").trim();
}

// Los teamKey canónicos de lib/teams.mjs están sin acentos (para poder comparar);
// aquí se recuperan solo para el título visible en español.
const TEAM_LABEL_ES = {
  espana: "España", alemania: "Alemania", inglaterra: "Inglaterra", francia: "Francia",
  brasil: "Brasil", italia: "Italia", japon: "Japón", escocia: "Escocia",
  "arabia saudi": "Arabia Saudí", "cabo verde": "Cabo Verde", jordania: "Jordania",
  haiti: "Haití", panama: "Panamá", colombia: "Colombia", "republica checa": "República Checa",
  holanda: "Holanda", gales: "Gales", croacia: "Croacia", ucrania: "Ucrania",
  turquia: "Turquía", suiza: "Suiza", irlanda: "Irlanda", grecia: "Grecia",
  suecia: "Suecia", polonia: "Polonia", hungria: "Hungría", noruega: "Noruega",
  finlandia: "Finlandia", belgica: "Bélgica", islandia: "Islandia", corea: "Corea",
  egipto: "Egipto", "estados unidos": "Estados Unidos", camerun: "Camerún",
  "costa de marfil": "Costa de Marfil",
  "cruz azul": "Cruz Azul", psg: "PSG", venezia: "Venezia",
  "sporting lisboa": "Sporting Lisboa", "club america": "Club América", tigres: "Tigres",
  "universidad de chile": "Universidad de Chile", "universidad catolica": "Universidad Católica",
  colonia: "Colonia", "hannover 96": "Hannover 96", napoles: "Nápoles", bolonia: "Bolonia",
  comoras: "Comoras", "sao paulo": "São Paulo", "bayern munich": "Bayern Múnich",
  "atletico de madrid": "Atlético de Madrid", "inter de milan": "Inter de Milán",
  "real betis": "Real Betis", "athletic bilbao": "Athletic Bilbao", fiorentina: "Fiorentina",
  brujas: "Brujas",
};

const KIT_LABEL_ES = {
  1: "primera equipación",
  2: "segunda equipación",
  3: "tercera equipación",
  4: "cuarta equipación",
  gk: "portero",
  sp: "edición especial",
  retro: "retro",
};

// Años de 4 cifras primero (evita que "2026 World Cup" se lea como temporada 20-26),
// luego rangos de 2 cifras con separador, y por último 4 cifras compactas tipo "2627".
// Debe llamarse SOLO sobre texto ya sin rangos de talla (si no, "16-28" de una talla de
// niño se confunde con una temporada). Devuelve también el texto exacto matcheado para
// poder quitarlo antes de extraer el nombre del equipo.
function parseSeason(text) {
  let m = text.match(/\b(19|20)(\d{2})\b/);
  if (m) return { key: m[2], raw: m[0] };
  m = text.match(/\b(\d{2})[\/\-. ](\d{2})\b/);
  if (m) return { key: `${m[1]}-${m[2]}`, raw: m[0] };
  m = text.match(/\b(\d{2})(\d{2})\b/);
  if (m && +m[1] >= 19 && +m[1] <= 29) return { key: `${m[1]}-${m[2]}`, raw: m[0] };
  return null;
}

function parseKit(normalized) {
  if (/goalkeeper|portero/.test(normalized)) return "gk";
  if (/\bthird\b|tercera/.test(normalized)) return "3";
  if (/\bfourth\b|cuarta/.test(normalized)) return "4";
  if (/second away|\baway\b|segunda|visitante/.test(normalized)) return "2";
  if (/\bhome\b|primera|\blocal\b/.test(normalized)) return "1";
  if (/special edition|edicion especial/.test(normalized)) return "sp";
  if (/retro/.test(normalized)) return "retro";
  return null;
}

function parseAudience(rawTitle, normalized) {
  if (/#\s*1[68]\s*[-~]\s*#?\s*2[08]|1[68]\s*#\s*[-~]\s*2[08]\s*#/.test(rawTitle)) return "nino";
  if (/\bkids?\b|\bchildren\b/.test(normalized)) return "nino";
  if (/\bwomen'?s?\b|\bfemale\b/.test(normalized)) return "mujer";
  return "adulto";
}

// Quita rangos de talla (S-4XL, S~2XL, #16-#28...) para no confundir al detector de equipo
// ni a parseSeason. Las tallas de niño solo usan {16,18,20,22,24,26,28}: se filtran por
// valor exacto para no morder temporadas con la misma forma NN-NN (ej. "84-85", "01-02").
const KID_SIZE_ALT = "(?:16|18|20|22|24|26|28)";
function stripSizeRanges(s) {
  return s
    .replace(new RegExp(`#?\\s*${KID_SIZE_ALT}\\s*#?\\s*[-~]\\s*#?\\s*${KID_SIZE_ALT}\\s*#?`, "g"), " ")
    .replace(/\bS\s*[-~]\s*\d?X*L\b/gi, " ")
    .replace(/\b\d?X*L\s*[-~]\s*\d?X*L\b/gi, " ");
}

export function parseAlbumTitle(rawTitle) {
  const withoutSizes = stripSizeRanges(rawTitle);
  const normalized = normalizeText(withoutSizes);

  // La temporada se busca SOLO en texto ya sin rangos de talla (si no, "16-28" de una
  // talla de niño se lee como temporada). Se quita el texto matcheado antes de sacar
  // el nombre del equipo, si no queda pegado ("2627 oviedo").
  const season = parseSeason(normalized);
  const seasonKey = season?.key ?? null;
  const withoutSeason = season ? normalized.replace(season.raw, " ") : normalized;

  const kitKey = parseKit(normalized);
  const audience = parseAudience(rawTitle, normalized);

  // Primero intenta un alias conocido (traducciones/apodos), si no, usa lo que queda
  // tras quitar todo el ruido: para nombres propios iguales en ES/EN (Real Madrid,
  // Arsenal...) eso ya es el nombre del equipo.
  const teamKey = findTeamKey(normalized) || normalizeText(extractTeamText(withoutSeason)) || null;

  if (!seasonKey || !kitKey || !teamKey || teamKey.length < 3) return null;

  const teamLabel =
    TEAM_LABEL_ES[teamKey] ||
    teamKey
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  const kitLabel = KIT_LABEL_ES[kitKey];
  const title = `${seasonKey} ${teamLabel} ${kitLabel}`.replace(/\s+/g, " ").trim();

  return { seasonKey, teamKey, kitKey, audience, title, rawTitle };
}

export function productKey(p) {
  return `${p.seasonKey}|${p.teamKey}|${p.kitKey}|${p.audience}`;
}
