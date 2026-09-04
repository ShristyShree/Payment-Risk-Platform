/**
 * Consistent color-coding for risk tiers and transaction statuses,
 * used on Dashboard, History, and Details — so a color always means the
 * same thing everywhere in the app, per the design brief's requirement
 * that LOW/MEDIUM/HIGH/CRITICAL be "visually distinguishable."
 */

const TIER_STYLES = {
  LOW: 'text-[var(--color-risk-low)] bg-[var(--color-risk-low-bg)] border-[var(--color-risk-low)]/30',
  MEDIUM: 'text-[var(--color-risk-medium)] bg-[var(--color-risk-medium-bg)] border-[var(--color-risk-medium)]/30',
  HIGH: 'text-[var(--color-risk-high)] bg-[var(--color-risk-high-bg)] border-[var(--color-risk-high)]/30',
  CRITICAL: 'text-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)] border-[var(--color-risk-critical)]/30',
};

const STATUS_STYLES = {
  ALLOWED: 'text-[var(--color-risk-low)] bg-[var(--color-risk-low-bg)] border-[var(--color-risk-low)]/30',
  WARNED: 'text-[var(--color-risk-medium)] bg-[var(--color-risk-medium-bg)] border-[var(--color-risk-medium)]/30',
  UNDER_REVIEW: 'text-[var(--color-risk-high)] bg-[var(--color-risk-high-bg)] border-[var(--color-risk-high)]/30',
  BLOCKED: 'text-[var(--color-risk-critical)] bg-[var(--color-risk-critical-bg)] border-[var(--color-risk-critical)]/30',
  FLAGGED: 'text-[var(--color-risk-high)] bg-[var(--color-risk-high-bg)] border-[var(--color-risk-high)]/30',
};

function Badge({ value, styleMap, fallbackLabel }) {
  if (!value) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-2)]">
        {fallbackLabel}
      </span>
    );
  }

  const classes = styleMap[value] || 'text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] border-[var(--color-border)]';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${classes}`}>
      {value.replace('_', ' ')}
    </span>
  );
}

export function RiskTierBadge({ tier }) {
  return <Badge value={tier} styleMap={TIER_STYLES} fallbackLabel="No score yet" />;
}

export function StatusBadge({ status }) {
  return <Badge value={status} styleMap={STATUS_STYLES} fallbackLabel="Unknown" />;
}