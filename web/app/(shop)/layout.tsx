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

      <footer className="page-width fp-footer">
        <div className="fp-footer__col">
          <span className="font-display" style={{ fontSize: "1.6rem" }}>FUT PROV</span>
          <p>El catálogo más completo de camisetas y el acceso directo a sus proveedores.</p>
        </div>
        <div className="fp-footer__col">
          <span className="fp-footer__heading">Navegación</span>
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/#proveedores">Proveedores</Link>
        </div>
        <div className="fp-footer__col">
          <span className="fp-footer__heading">Legal</span>
          <Link href="/legal/aviso-legal">Aviso legal</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/reembolsos">Reembolsos</Link>
        </div>
        <div className="fp-footer__bottom">
          <span>© {new Date().getFullYear()} Fut Prov</span>
        </div>
      </footer>

      <FpAnimations />
    </>
  );
}
