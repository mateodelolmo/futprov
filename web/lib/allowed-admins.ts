import type { AdminRole } from "@prisma/client";

// Lista cerrada de quien puede registrarse en el CRM. No hay registro abierto:
// si un email no está aquí, no puede crear cuenta aunque conozca la URL.
// OWNER (Mateo) ve el panel pero no puede modificar nada; STAFF (Lucas) tiene control total.
export const ALLOWED_ADMINS: Record<string, { role: AdminRole; name: string }> = {
  "mateodelolmo@gmail.com": { role: "OWNER", name: "Mateo" },
  "lucasdelolmo@gmail.com": { role: "STAFF", name: "Lucas" },
  "odriolautomation@gmail.com": { role: "STAFF", name: "Lucas (automatización)" },
};

export function isAllowedAdminEmail(email: string): boolean {
  return email.toLowerCase() in ALLOWED_ADMINS;
}

export function canEditCrm(role: AdminRole): boolean {
  return role === "STAFF";
}
