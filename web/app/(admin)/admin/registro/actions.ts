"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ALLOWED_ADMINS, isAllowedAdminEmail } from "@/lib/allowed-admins";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function registerAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos.";
  }
  const { email, password } = parsed.data;

  if (!isAllowedAdminEmail(email)) {
    return "Este email no tiene acceso al panel.";
  }

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return "Ya existe una cuenta con este email. Inicia sesión.";
  }

  const { role, name } = ALLOWED_ADMINS[email];
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.create({ data: { email, passwordHash, role, name } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (err) {
    if (err instanceof AuthError) {
      return "Cuenta creada, pero el inicio de sesión falló. Prueba a entrar manualmente.";
    }
    throw err;
  }
}
