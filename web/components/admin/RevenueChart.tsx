export function RevenueChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const width = 600;
  const height = 140;
  const barWidth = width / data.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Ingresos de los últimos 30 días"
      preserveAspectRatio="none"
    >
      {data.map((value, i) => {
        const barHeight = (value / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * barWidth + 1}
            y={height - barHeight}
            width={Math.max(barWidth - 2, 1)}
            height={barHeight}
            fill="#3b82f6"
            rx={1}
          >
            <title>{(value / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</title>
          </rect>
        );
      })}
    </svg>
  );
}
