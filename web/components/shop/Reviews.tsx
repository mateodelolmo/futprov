const REVIEWS = [
  {
    rating: 5,
    text: "Llegó antes de lo esperado y la calidad es una pasada, parece oficial. Repetiré seguro.",
    author: "Marcos R.",
    product: "Real Madrid 25-26",
  },
  {
    rating: 5,
    text: "Pedí la versión Player con mi nombre y dorsal, quedó perfecta. Muy transpirable.",
    author: "Laura G.",
    product: "Barcelona 25-26",
  },
  {
    rating: 4,
    text: "Buena relación calidad-precio, la talla recomendada acertó totalmente.",
    author: "Iván T.",
    product: "Selección España",
  },
  {
    rating: 5,
    text: "Se la regalé a mi hijo, la versión niño le queda genial y el envío fue rapidísimo.",
    author: "Cristina M.",
    product: "Manchester City niño",
  },
  {
    rating: 5,
    text: "El parche personalizado quedó tal cual lo pedí. Atención al cliente muy atenta.",
    author: "David P.",
    product: "Retro AC Milan",
  },
];

export function Reviews() {
  return (
    <div id="resenas" className="fp-section page-width" style={{ padding: "6rem 2rem" }}>
      <span className="fp-kicker">Opiniones</span>
      <h2 className="title text-3xl font-display">Lo que dicen nuestros clientes</h2>
      <div className="fp-reviews">
        {REVIEWS.map((review, i) => (
          <div
            key={review.author}
            className="fp-review"
            data-fp-inview
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="fp-review__stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < review.rating ? "fp-star--full" : "fp-star--empty"}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="fp-review__text">&quot;{review.text}&quot;</p>
            <p className="fp-review__author">
              {review.author}
              <span> · {review.product}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
