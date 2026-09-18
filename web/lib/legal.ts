export type LegalSlug = "aviso-legal" | "privacidad" | "terminos" | "reembolsos";

const EMPRESA = "[COMPLETAR: razón social / nombre del titular]";
const NIF = "[COMPLETAR: NIF/CIF]";
const DOMICILIO = "[COMPLETAR: domicilio fiscal]";
const EMAIL = "[COMPLETAR: email de contacto]";

export const LEGAL_PAGES: Record<LegalSlug, { title: string; body: string }> = {
  "aviso-legal": {
    title: "Aviso legal",
    body: `
<p>En cumplimiento de la normativa vigente, se informa de los siguientes datos identificativos:</p>
<ul>
  <li><strong>Titular:</strong> ${EMPRESA}</li>
  <li><strong>NIF/CIF:</strong> ${NIF}</li>
  <li><strong>Domicilio:</strong> ${DOMICILIO}</li>
  <li><strong>Contacto:</strong> ${EMAIL}</li>
</ul>
<p>El acceso y uso de este sitio web implica la aceptación de las condiciones recogidas en este aviso legal.</p>
`,
  },
  privacidad: {
    title: "Política de privacidad",
    body: `
<p>Responsable del tratamiento: ${EMPRESA} (${EMAIL}).</p>
<p>Los datos personales facilitados (email, y en su caso nombre) se utilizan únicamente para gestionar el pedido, enviar el acceso digital comprado y atender consultas. No se ceden a terceros salvo obligación legal o proveedores necesarios para el servicio (procesador de pago, envío de email).</p>
<p>Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a ${EMAIL}.</p>
<p>Los datos se conservan mientras exista relación contractual y, posteriormente, durante los plazos legalmente exigibles.</p>
`,
  },
  terminos: {
    title: "Términos y condiciones",
    body: `
<p>Al comprar un acceso digital en este sitio aceptas estas condiciones.</p>
<p><strong>Qué se vende:</strong> acceso a información de contacto de proveedores externos y/o guías digitales. No se venden ni envían prendas físicas desde este sitio; las camisetas mostradas en el catálogo son un escaparate informativo.</p>
<p><strong>Precio y pago:</strong> los precios incluyen impuestos aplicables. El pago se procesa mediante un proveedor externo de pago.</p>
<p><strong>Entrega:</strong> el acceso digital (contacto o archivo) se entrega por email de forma prácticamente inmediata tras confirmarse el pago.</p>
<p><strong>Derecho de desistimiento:</strong> al tratarse de contenido digital que se entrega de forma inmediata con tu consentimiento expreso, aceptas que pierdes el derecho de desistimiento en el momento en que se te entrega el acceso, conforme a la normativa de consumidores de la UE.</p>
<p>Para cualquier incidencia, contacta con ${EMAIL}.</p>
`,
  },
  reembolsos: {
    title: "Política de reembolsos",
    body: `
<p>Si el acceso digital comprado no llega a tu email en un plazo razonable, o el contenido entregado no corresponde con lo comprado, escríbenos a ${EMAIL} y lo revisamos.</p>
<p>Dado que el contenido se entrega de forma inmediata (ver <a href="/legal/terminos">términos y condiciones</a>), una vez entregado y usado el acceso no se admiten devoluciones salvo error nuestro o defecto del producto entregado.</p>
<p>Los reembolsos aprobados se procesan al mismo método de pago utilizado en la compra.</p>
`,
  },
};
