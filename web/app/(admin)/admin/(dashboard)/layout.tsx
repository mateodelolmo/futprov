import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">FUT PROV</div>
        <AdminNav />
        <div className="admin-sidebar__user">
          <div>
            <p className="admin-sidebar__email">{session.user.email}</p>
            <p className="admin-sidebar__role">{session.user.role === "OWNER" ? "Propietario" : "Administrador"}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="admin-sidebar__logout">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
