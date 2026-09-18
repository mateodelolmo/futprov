import Link from "next/link";
import { FpAnimations } from "@/components/shop/FpAnimations";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="page-width" style={{ position: "sticky", top: 0, zIndex: 10, background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.4rem 2rem",
          }}
        >
          <Link href="/" className="font-display" style={{ fontSize: "1.6rem", letterSpacing: "0.02em" }}>
            FUT PROV
          </Link>
          <div style={{ display: "flex", gap: "2rem", fontSize: "1.3rem" }}>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/#proveedores">Proveedores</Link>
          </div>
        </nav>
      </header>

      <div style={{ flex: 1 }}>{children}</div>

      <footer
        className="page-width"
        style={{
          padding: "3rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: "1.3rem",
          color: "rgba(255,255,255,0.55)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span>© {new Date().getFullYear()} Fut Prov</span>
      </footer>

      <FpAnimations />
    </>
  );
}
