# Setup

Tema base: Dawn oficial (Shopify), clonado limpio en esta carpeta. Contenido/producto lo metes tú desde el admin.

## 1. Conectar con tu tienda

```bash
npx @shopify/cli theme dev --store TU-TIENDA.myshopify.com
```

Login primera vez pide autenticación en navegador.

## 2. Subir tema a la tienda

```bash
npx @shopify/cli theme push --store TU-TIENDA.myshopify.com
```

## 3. Crear el producto digital (en el admin de Shopify, no en código)

1. Admin → Products → Add product.
2. Tipo: producto digital (marca "This is a physical product" desactivado, o usa variante sin envío).
3. Sube el PDF: necesitas una app de entrega digital (ej. "Digital Downloads" de Shopify, gratis) — se instala desde el App Store, se asocia el PDF al producto, y Shopify lo envía automáticamente tras el pago.
4. Precio, imagen, descripción: los pones tú en el admin.

## 4. Preview local

```bash
npx @shopify/cli theme dev --store TU-TIENDA.myshopify.com
```

Abre localhost y muestra la tienda en vivo con el tema Dawn.
