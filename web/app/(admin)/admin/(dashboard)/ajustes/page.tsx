import { getSiteSettings } from "@/lib/site-settings";
import { auth } from "@/lib/auth";
import { canEditCrm } from "@/lib/allowed-admins";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function AdminAjustesPage() {
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);
  const canEdit = session?.user ? canEditCrm(session.user.role) : false;

  return (
    <div>
      <h1>Ajustes</h1>
      {!canEdit && <p className="admin-readonly-banner">Tu cuenta es de solo lectura.</p>}
      <div className="admin-panel">
        <h2>Textos de la home</h2>
        <SiteSettingsForm settings={settings} canEdit={canEdit} />
      </div>
    </div>
  );
}
