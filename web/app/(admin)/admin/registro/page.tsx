"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "./actions";

export default function AdminRegistroPage() {
  const [error, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="admin-auth">
      <form action={formAction} className="admin-auth__card">
        <h1>Crear acceso</h1>
        <p className="admin-auth__subtitle">Solo para emails autorizados</p>

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Elige tu contraseña</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />

        {error && (
          <p role="alert" className="admin-auth__error">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear cuenta"}
        </button>

        <Link href="/admin/login" className="admin-auth__link">
          Ya tengo cuenta
        </Link>
      </form>
    </main>
  );
}
