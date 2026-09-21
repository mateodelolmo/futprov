import { auth } from "./auth";
import { canEditCrm } from "./allowed-admins";

// Toda Server Action de escritura del CRM empieza llamando a esto: exige sesión
// y bloquea a OWNER (Mateo, solo lectura). El middleware protege las páginas,
// pero las Server Actions se pueden invocar directamente, así que hay que
// revalidar aquí también.
export async function requireEditableSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");
  if (!canEditCrm(session.user.role)) throw new Error("Tu cuenta es de solo lectura.");
  return session;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");
  return session;
}
