/**
 * A single summary metric card for the Dashboard. Deliberately simple —
 * a label, a number, and an optional accent color — since the design
 * brief explicitly says "not a huge enterprise application."
 */
export default function StatCard({ label, value, accent = 'default' }) {
  const accentClasses = {
    default: 'text-[var(--color-text-primary)]',
    low: 'text-[var(--color-risk-low)]',
    medium: 'text-[var(--color-risk-medium)]',
    high: 'text-[var(--color-risk-high)]',
    critical: 'text-[var(--color-risk-critical)]',
    brand: 'text-[var(--color-brand)]',
  };

  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-3xl font-semibold tabular-nums ${accentClasses[accent]}`}>{value}</span>
    </div>
  );
}