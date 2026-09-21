"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="admin-auth">
      <form action={formAction} className="admin-auth__card">
        <h1>Panel de administración</h1>
        <p className="admin-auth__subtitle">Fut Prov</p>

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />

        {error && (
          <p role="alert" className="admin-auth__error">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>

        <Link href="/admin/registro" className="admin-auth__link">
          ¿Primera vez? Crea tu contraseña
        </Link>
      </form>
    </main>
  );
}
