# Fut Prov — web (Next.js)

Migración de la tienda Shopify `futprov-store.myshopify.com` a Next.js en Vercel.
Plan completo: `C:\Users\Lucas\.claude\plans\toasty-prancing-pumpkin.md`.

## Stack
- Next.js 15 (App Router, TypeScript), route groups `(shop)` y `(admin)` en un solo proyecto.
- Prisma + Neon Postgres.
- Stripe Checkout (pagos) — sustituye a Shopify Payments.
- Auth.js v5 (Credentials) para el CRM en `/admin`.
- Resend + React Email para los correos de entrega digital.
- Tailwind v4. Tokens y animaciones custom portados de `assets/futprov.css` / `futprov.js` a `styles/fp.css`.

## Correr en local
```bash
npm install
cp .env.example .env    # rellenar DATABASE_URL, STRIPE_*, RESEND_API_KEY, AUTH_SECRET
npx prisma migrate dev
npx prisma db seed       # lee ../tools/import.json
npm run dev
```

## Modelo de negocio (no cambiar sin confirmarlo)
Las camisetas del catálogo **no se venden** directamente: son escaparate de marketing que
redirige a 5 productos digitales (acceso a proveedor) que sí se cobran vía Stripe.
Ver el plan para el detalle completo del porqué.

## Desplegar
Proyecto Vercel con *Root Directory* `web`. Sin dominio propio: se usa el subdominio
gratuito `*.vercel.app` que se reclame al crear el proyecto.

## Convenciones
- Componentes de escaparate en `components/shop/`, CRM en `components/admin/`.
- Mutaciones del CRM con Server Actions + Zod, nunca fetch a mano desde el cliente.
- Nada de datos sensibles (tokens, WhatsApp de proveedores) en código: viven en la base de
  datos (`DigitalProduct.deliveryBody`) o en variables de entorno de Vercel.
