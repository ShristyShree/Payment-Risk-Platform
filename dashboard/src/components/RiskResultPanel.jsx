import { RiskTierBadge, StatusBadge } from './RiskBadge';

const INTERVENTION_COPY = {
  NONE: 'This transaction was analyzed by the ML risk system and was allowed — no unusual risk signals were found.',
  WARNING: 'This transaction was analyzed by the ML risk system and was allowed with a warning due to elevated risk signals.',
  REVIEW: 'This transaction was analyzed by the ML risk system and was flagged for manual review because it was considered high risk.',
  BLOCK: 'This transaction was analyzed by the ML risk system and was blocked because it was considered critical risk.',
};

/**
 * Renders the real backend response for a transaction's risk assessment.
 * Every value here comes directly from the API — nothing is computed or
 * invented client-side (per the project's explicit rule against faking
 * risk scores).
 */
export default function RiskResultPanel({ transaction, riskFactors, intervention }) {
  const tier = transaction.riskTier;
  const score = transaction.riskScore;
  const factors = riskFactors ?? transaction.riskFactors ?? [];
  const interventionValue = intervention ?? transaction.intervention;

  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Risk Score</div>
          <div className="text-4xl font-bold tabular-nums">
            {score !== null && score !== undefined ? Math.round(score) : '—'}
            <span className="text-lg font-normal text-[var(--color-text-muted)]"> / 100</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiskTierBadge tier={tier} />
          <StatusBadge status={transaction.status} />
        </div>
      </div>

      {interventionValue && INTERVENTION_COPY[interventionValue] && (
        <div className="px-6 py-4 border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          {INTERVENTION_COPY[interventionValue]}
        </div>
      )}

      <div className="p-6">
        <div className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Risk Factors
        </div>
        {factors.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No specific risk factors were flagged for this transaction.</p>
        ) : (
          <ul className="space-y-2">
            {factors.map((f, i) => (
              <li
                key={f.factor ?? i}
                className="flex items-start justify-between gap-4 bg-[var(--color-surface-2)] rounded-lg px-4 py-3"
              >
                <span className="text-sm text-[var(--color-text-primary)]">{f.description ?? f.factor}</span>
                {f.weight !== undefined && (
                  <span className="text-xs font-mono text-[var(--color-text-muted)] shrink-0">+{f.weight}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>Transaction ID</span>
        <span className="font-mono">{transaction.transactionId}</span>
      </div>
    </div>
  );
}