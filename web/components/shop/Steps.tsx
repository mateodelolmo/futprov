const STEPS = [
  {
    title: "Elige tu camiseta",
    text: "Recorre el catálogo y encuentra el equipo, la temporada y la equipación que quieres.",
  },
  {
    title: "Personalízala",
    text: "Añade número, dorsal, nombre y parche. Cada camiseta se prepara a tu medida.",
  },
  {
    title: "Recíbela en casa",
    text: "Gestionamos el pedido con el proveedor y te llega lista para jugar. Envío gratis desde 89€.",
  },
];

export function Steps() {
  return (
    <div className="fp-section page-width" style={{ padding: "5rem 2rem" }}>
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
