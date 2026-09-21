"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/digitales", label: "Productos digitales" },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar__nav">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? "is-active" : ""}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
