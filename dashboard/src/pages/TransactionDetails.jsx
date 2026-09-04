import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiskResultPanel from '../components/RiskResultPanel';
import { getTransactionById } from '../services/transactionsApi';

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-0">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {label}
      </span>

      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await getTransactionById(id);

        // DEBUG: see exactly what the backend returns
        console.log('🔥 TRANSACTION DETAILS DATA:', data);

        if (!cancelled) {
          setTransaction(data);
        }
      } catch (err) {
        console.error('🔥 TRANSACTION DETAILS ERROR:', err);

        if (!cancelled) {
          const message =
            err.response?.status === 403
              ? "You don't have permission to view this transaction."
              : err.response?.status === 404
              ? 'Transaction not found.'
              : 'Could not load this transaction.';

          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    } else {
      setLoading(false);
      setError('No transaction ID was provided.');
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-6xl">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Transaction Details
          </h1>

          <p className="mt-1 text-[var(--color-text-secondary)]">
            {transaction?.transactionId ||
              'View transaction risk analysis and details'}
          </p>
        </div>

        <button
          onClick={() => navigate('/transactions')}
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          ← Back to history
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-10 text-center text-[var(--color-text-secondary)] text-sm">
          Loading transaction…
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-[var(--color-risk-critical-bg)] border border-[var(--color-risk-critical)]/30 text-[var(--color-risk-critical)] text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* TRANSACTION */}
      {!loading && !error && transaction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-5">

            {/* TRANSACTION INFORMATION */}
            <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-5">

              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                Transaction Information
              </h2>

              <InfoRow
                label="Transaction ID"
                value={
                  <span className="font-mono text-xs">
                    {transaction.transactionId}
                  </span>
                }
              />

              <InfoRow
                label="Amount"
                value={formatAmount(transaction.amount)}
              />

              <InfoRow
                label="Payee"
                value={transaction.payeeId}
              />

              <InfoRow
                label="Location"
                value={transaction.location}
              />

              <InfoRow
                label="Device"
                value={transaction.deviceId}
              />

              <InfoRow
                label="Timestamp"
                value={
                  transaction.timestamp
                    ? new Date(transaction.timestamp).toLocaleString('en-IN')
                    : '—'
                }
              />

            </div>

            {/* ML PREDICTION */}
            <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-5">

              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                ML Prediction
              </h2>

              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                The ML service's raw prediction output isn't stored on the
                transaction record. The persisted risk score, risk tier,
                risk factors, and transaction status shown on this page come
                from the transaction record returned by the backend.
              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <RiskResultPanel transaction={transaction} />

        </div>
      )}

      {/* SAFETY DEBUG MESSAGE */}
      {!loading && !error && !transaction && (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-10 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Transaction data was not returned by the server.
          </p>
        </div>
      )}

    </div>
  );
}