"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (err) {
    if (err instanceof AuthError) {
      return "Email o contraseña incorrectos.";
    }
    throw err;
  }
}
