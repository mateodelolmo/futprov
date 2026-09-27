export function PaymentMethods({ className }: { className?: string }) {
  return (
    <div className={`fp-payments${className ? ` ${className}` : ""}`}>
      <div className="fp-payments__icons" aria-hidden="true">
        <svg viewBox="0 0 48 32" className="fp-payments__icon" role="img" aria-label="Visa">
          <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
          <text x="24" y="21" textAnchor="middle" fontSize="11" fontWeight="700" fontStyle="italic" fill="currentColor">
            VISA
          </text>
        </svg>
        <svg viewBox="0 0 48 32" className="fp-payments__icon" role="img" aria-label="Mastercard">
          <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
          <circle cx="20" cy="16" r="8" fill="currentColor" opacity="0.55" />
          <circle cx="28" cy="16" r="8" fill="currentColor" opacity="0.85" />
        </svg>
        <svg viewBox="0 0 48 32" className="fp-payments__icon" role="img" aria-label="American Express">
          <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
          <text x="24" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">
            AMEX
          </text>
        </svg>
      </div>
      <span className="fp-payments__secure">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Pago seguro con Stripe
      </span>
    </div>
  );
}
