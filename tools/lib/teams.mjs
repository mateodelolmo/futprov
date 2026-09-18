// Normalización de nombres de equipo/selección para comparar títulos de Yupoo (inglés,
// a veces mal traducido) contra los títulos de la tienda (español). No es exhaustivo:
// cualquier nombre propio ausente del mapa pasa tal cual (funciona para la mayoría,
// ej. Arsenal, Benfica, Feyenoord son iguales en ambos idiomas).

// alias (normalizado: minúsculas, sin acentos) -> clave canónica
export const TEAM_ALIASES = {
  // selecciones
  spain: "espana", espana: "espana", "spanish team": "espana", spanish: "espana",
  germany: "alemania", alemania: "alemania", "german clover": "alemania",
  england: "inglaterra", inglaterra: "inglaterra",
  france: "francia", francia: "francia", french: "francia",
  brazil: "brasil", brazilian: "brasil", brasil: "brasil",
  italy: "italia", italia: "italia",
  japan: "japon", japon: "japon",
  scotland: "escocia", escocia: "escocia",
  "saudi arabia": "arabia saudi", "arabia saudi": "arabia saudi",
  "cape verde": "cabo verde", "cabo verde": "cabo verde",
  jordan: "jordania", jordania: "jordania",
  haiti: "haiti", haiti_: "haiti",
  panama: "panama",
  columbia: "colombia", colombia: "colombia",
  czech: "republica checa", "republica checa": "republica checa",
  netherlands: "holanda", holanda: "holanda", holand: "holanda",
  wales: "gales", gales: "gales",
  croatia: "croacia", croacia: "croacia",
  ukraine: "ucrania", ucrania: "ucrania",
  turkey: "turquia", turquia: "turquia",
  switzerland: "suiza", suiza: "suiza",
  ireland: "irlanda", irlanda: "irlanda",
  greek: "grecia", greece: "grecia", grecia: "grecia",
  albania: "albania",
  sweden: "suecia", suecia: "suecia",
  poland: "polonia", polonia: "polonia",
  hungary: "hungria", hungria: "hungria",
  norway: "noruega", noruega: "noruega",
  finland: "finlandia", finlandia: "finlandia",
  belgium: "belgica", belgica: "belgica",
  iceland: "islandia", islandia: "islandia",
  "costa rica": "costa rica",
  korea: "corea", "south korea": "corea", corea: "corea",
  ghana: "ghana",

  // clubs from 26-27 season (missing in aliases)
  ajax: "ajax",
  "leicester city": "leicester city",
  "west ham": "west ham",
  brighton: "brighton",
  "aston villa": "aston villa",
  "hamburger sv": "hamburger sv",
  valencia: "valencia",
  bournemouth: "bournemouth",
  bielefeld: "bielefeld",
  aberdeen: "aberdeen",
  dinamo: "dinamo",
  besiktas: "besiktas",
  roma: "roma",
  "psv eindhoven": "psv eindhoven",
  "inter miami": "inter miami", miami: "inter miami",
  palermo: "palermo",
  venezia: "venezia",
  egypt: "egipto", egipto: "egipto",
  mexico: "mexico",
  usa: "estados unidos", "united states": "estados unidos", "estados unidos": "estados unidos",
  ecuador: "ecuador",
  paraguay: "paraguay",
  cameroon: "camerun", camerun: "camerun",
  ivory: "costa de marfil", "ivory coast": "costa de marfil",
  jamaica: "jamaica",
  guatemala: "guatemala",
  curacao: "curacao",
  canada: "canada",
  venezuela: "venezuela",
  chile: "chile",
  uruguay: "uruguay",
  peru: "peru",
  argentina: "argentina",
  austria: "austria",
  portugal: "portugal",

  // mistraducciones / apodos detectados en Yupoo
  "blue cross": "cruz azul", "cruz azul": "cruz azul",
  "man u": "manchester united", "man united": "manchester united", "manchester united": "manchester united",
  paris: "psg", "paris saint germain": "psg", psg: "psg",
  venice: "venezia", venezia: "venezia",
  lisbon: "sporting lisboa", "sporting lisboa": "sporting lisboa", sporting: "sporting lisboa",
  americas: "club america", "club america": "club america", america: "club america",
  tigers: "tigres", tigres: "tigres",
  celtics: "celtic", celtic: "celtic",
  "university of chile": "universidad de chile", "universidad de chile": "universidad de chile",
  catholic: "universidad catolica", "universidad catolica": "universidad catolica",
  cologne: "colonia", colonia: "colonia", koln: "colonia",
  hanover: "hannover 96", "hannover 96": "hannover 96", hannover: "hannover 96",
  naples: "napoles", napoli: "napoles", napoles: "napoles",
  bologna: "bolonia", bolonia: "bolonia",
  comoro: "comoras", comoros: "comoras", comoras: "comoras",
  "sao paulo": "sao paulo", "são paulo": "sao paulo",

  // clubes con grafía distinta ES/EN habitual en esta tienda
  "bayern munich": "bayern munich", "bayern múnich": "bayern munich", bayern: "bayern munich",
  "atletico madrid": "atletico de madrid", "atletico de madrid": "atletico de madrid",
  "inter milan": "inter de milan", "inter de milan": "inter de milan", inter: "inter de milan",
  "ac milan": "ac milan",
  betis: "real betis", "real betis": "real betis",
  bilbao: "athletic bilbao", "athletic bilbao": "athletic bilbao", athletic: "athletic bilbao",
  malaga: "malaga",
  florence: "fiorentina", fiorentina: "fiorentina",
  bruges: "brujas", brugge: "brujas", brujas: "brujas",
  turin: "turin",
  nuremberg: "nuremberg", nurnberg: "nuremberg",
};

// tipo de equipación: clave inglesa detectada -> código corto
export const KIT_ALIASES = {
  home: "1", local: "1", primera: "1",
  away: "2", visitante: "2", segunda: "2", "second away": "2",
  third: "3", tercera: "3",
  fourth: "4", cuarta: "4",
  goalkeeper: "gk", portero: "gk",
  "special edition": "sp", especial: "sp", special: "sp",
  retro: "retro",
};

export function normalizeText(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Busca la clave canónica de equipo dentro de un texto ya normalizado.
// Estrategia: probar los alias más largos primero (evita que "man" gane a "man u").
const SORTED_ALIASES = Object.keys(TEAM_ALIASES).sort((a, b) => b.length - a.length);

export function findTeamKey(normalizedText) {
  for (const alias of SORTED_ALIASES) {
    if (normalizedText.includes(alias)) return TEAM_ALIASES[alias];
  }
  return null;
}
