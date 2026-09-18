import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEGAL_PAGES, type LegalSlug } from "@/lib/legal";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) return {};
  return { title: `${page.title} · Fut Prov` };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug as LegalSlug];
  if (!page) notFound();

  return (
    <main className="page-width" style={{ padding: "4rem 2rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h1 className="text-3xl font-display mb-2">{page.title}</h1>
      <div
        style={{ fontSize: "1.4rem", lineHeight: 1.7, opacity: 0.85, marginTop: "1.6rem" }}
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </main>
  );
}
