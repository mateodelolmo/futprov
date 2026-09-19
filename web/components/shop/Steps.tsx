const STEPS = [
  {
    title: "Explora el catálogo",
    text: "Recorre las camisetas de todas las ligas y decide qué equipo, temporada y versión quieres.",
  },
  {
    title: "Compra el acceso",
    text: "Paga con tarjeta y recibe el contacto del proveedor al instante, sin esperas.",
  },
  {
    title: "Pide directo al proveedor",
    text: "Habla por WhatsApp con el proveedor y pide justo lo que quieras, al precio de fábrica.",
  },
];

export function Steps() {
  return (
    <div className="fp-section page-width" style={{ padding: "6rem 2rem" }}>
      <span className="fp-kicker">Proceso</span>
      <h2 className="title text-3xl font-display">Cómo funciona</h2>
      <div className="fp-steps" data-fp-inview>
        <div className="fp-steps__line">
          <div className="fp-steps__line-fill" />
        </div>
        {STEPS.map((step, i) => (
          <div key={step.title} className="fp-step">
            <div className="fp-step__num">{i + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
