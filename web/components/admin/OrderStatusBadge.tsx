const LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
  FAILED: "Fallido",
};

const CLASSES: Record<string, string> = {
  PENDING: "admin-badge--pending",
  PAID: "admin-badge--paid",
  REFUNDED: "admin-badge--refunded",
  FAILED: "admin-badge--failed",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <span className={`admin-badge ${CLASSES[status] ?? ""}`}>{LABELS[status] ?? status}</span>;
}
