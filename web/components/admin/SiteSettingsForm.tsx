"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction } from "@/app/(admin)/admin/(dashboard)/ajustes/actions";
import type { SITE_SETTING_DEFAULTS } from "@/lib/site-settings";

export function SiteSettingsForm({
  settings,
  canEdit,
}: {
  settings: Record<keyof typeof SITE_SETTING_DEFAULTS, string>;
  canEdit: boolean;
}) {
  const [error, formAction, pending] = useActionState(updateSiteSettingsAction, undefined);

  return (
    <form action={formAction} className="admin-form">
      <label>
        Texto de la barra de oferta
        <input name="offerbar_text" defaultValue={settings.offerbar_text} disabled={!canEdit} required />
      </label>

      <label>
        Titular del hero
        <input name="hero_headline" defaultValue={settings.hero_headline} disabled={!canEdit} required />
      </label>

      {error && (
        <p role="alert" style={{ color: "var(--admin-danger)", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}

      {canEdit && (
        <button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      )}
    </form>
  );
}
