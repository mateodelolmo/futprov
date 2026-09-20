import Link from "next/link";
import { FpAnimations } from "@/components/shop/FpAnimations";
import { CartButton } from "@/components/shop/CartButton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { getActiveDigitalProducts } from "@/lib/digital-products";
import { MobileNav } from "@/components/shop/MobileNav";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const digitalProducts = await getActiveDigitalProducts();
  const cartProducts = digitalProducts.map((p) => ({ handle: p.handle, title: p.title, priceCents: p.priceCents }));

  return (
    <CartProvider products={cartProducts}>
      <header className="page-width fp-nav-header">
        <nav className="fp-nav">
          <Link href="/" className="font-display fp-nav__logo">
            FUT PROV
          </Link>
          <div className="fp-nav__links">
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/#proveedores">Proveedores</Link>
          </div>
          <div className="fp-nav__actions">
            <CartButton />
            <MobileNav />
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
      <CartDrawer />
    </CartProvider>
  );
}
