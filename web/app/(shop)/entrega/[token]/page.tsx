import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EntregaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const delivery = await db.delivery.findUnique({
    where: { token },
    include: { digitalProduct: true },
  });

  if (!delivery) notFound();

  const expired = delivery.expiresAt < new Date();

  return (
    <main className="page-width" style={{ padding: "6rem 2rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1 className="text-3xl font-display mb-2">{delivery.digitalProduct.title}</h1>

      {expired ? (
        <p style={{ opacity: 0.7 }}>
          Este enlace caducó. Escríbenos y te lo reenviamos.
        </p>
      ) : (
        <>
          {delivery.digitalProduct.deliveryBody && (
            <div
              style={{ fontSize: "1.5rem", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: delivery.digitalProduct.deliveryBody }}
            />
          )}
          {delivery.digitalProduct.fileKey && (
            <a
              href={delivery.digitalProduct.fileKey}
              target="_blank"
              rel="noreferrer"
              className="button"
              style={{ marginTop: delivery.digitalProduct.deliveryBody ? "1.5rem" : 0, display: "inline-block" }}
            >
              Descargar PDF
            </a>
          )}
          {!delivery.digitalProduct.deliveryBody && !delivery.digitalProduct.fileKey && (
            <p style={{ opacity: 0.7 }}>Aún no hay contenido cargado para este acceso. Escríbenos.</p>
          )}
        </>
      )}
    </main>
  );
}
