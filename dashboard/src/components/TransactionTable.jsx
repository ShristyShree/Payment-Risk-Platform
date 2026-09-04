import { useNavigate } from 'react-router-dom';
import { RiskTierBadge, StatusBadge } from './RiskBadge';

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionTable({ transactions, emptyMessage = 'No transactions yet.' }) {
  const navigate = useNavigate();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-10 text-center text-[var(--color-text-secondary)] text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wide">
            <th className="px-5 py-3 font-medium">Transaction ID</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Date / Time</th>
            <th className="px-5 py-3 font-medium">Risk Score</th>
            <th className="px-5 py-3 font-medium">Risk Tier</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t._id}
              onClick={() => navigate(`/transactions/${t._id}`)}
              className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors"
            >
              <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-text-secondary)]">{t.transactionId}</td>
              <td className="px-5 py-3.5 font-medium tabular-nums">{formatAmount(t.amount)}</td>
              <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{formatTimestamp(t.timestamp)}</td>
              <td className="px-5 py-3.5 tabular-nums">
                {t.riskScore !== null && t.riskScore !== undefined ? `${Math.round(t.riskScore)} / 100` : '—'}
              </td>
              <td className="px-5 py-3.5"><RiskTierBadge tier={t.riskTier} /></td>
              <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}