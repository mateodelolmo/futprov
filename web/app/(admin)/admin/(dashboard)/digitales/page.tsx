import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canEditCrm } from "@/lib/allowed-admins";
import { DigitalProductForm } from "@/components/admin/DigitalProductForm";

export default async function AdminDigitalesPage() {
  const [products, session] = await Promise.all([
    db.digitalProduct.findMany({ orderBy: { title: "asc" } }),
    auth(),
  ]);
  const canEdit = session?.user ? canEditCrm(session.user.role) : false;

  return (
    <div>
      <h1>Productos digitales</h1>
      {!canEdit && <p className="admin-readonly-banner">Tu cuenta es de solo lectura: puedes ver pero no guardar cambios.</p>}

      {products.map((product) => (
        <div key={product.id} className="admin-panel">
          <h2>{product.title}</h2>
          <DigitalProductForm product={product} canEdit={canEdit} />
        </div>
      ))}
    </div>
  );
}
