import type { AdminRole } from "@prisma/client";

// Lista cerrada de quien puede registrarse en el CRM. No hay registro abierto:
// si un email no está aquí, no puede crear cuenta aunque conozca la URL.
// OWNER y STAFF tienen hoy el mismo control total del panel; el rol solo se usa
// para mostrar la etiqueta en la barra lateral.
export const ALLOWED_ADMINS: Record<string, { role: AdminRole; name: string }> = {
  "mateodelolmo@gmail.com": { role: "OWNER", name: "Mateo" },
  "lucasdelolmo@gmail.com": { role: "STAFF", name: "Lucas" },
  "odriolautomation@gmail.com": { role: "STAFF", name: "Lucas (automatización)" },
};

export function isAllowedAdminEmail(email: string): boolean {
  return email.toLowerCase() in ALLOWED_ADMINS;
}

export function canEditCrm(_role: AdminRole): boolean {
  return true;
}
