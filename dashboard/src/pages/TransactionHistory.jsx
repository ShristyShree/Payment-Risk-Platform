import { useEffect, useMemo, useState } from 'react';
import TransactionTable from '../components/TransactionTable';
import { listTransactions } from '../services/transactionsApi';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'ALLOWED', label: 'Allowed' },
  { key: 'WARNED', label: 'Warned' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'BLOCKED', label: 'Blocked' },
];

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError('');

        const data = await listTransactions();

        if (!cancelled) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load transaction history:', err);

        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              err.response?.data?.message ||
              'Could not load transaction history from the server.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = transactions;

    if (filter !== 'ALL') {
      result = result.filter(
        (transaction) => transaction.status === filter
      );
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((transaction) => {
        const transactionId =
          transaction.transactionId?.toLowerCase() || '';

        const payeeId =
          transaction.payeeId?.toLowerCase() || '';

        return (
          transactionId.includes(query) ||
          payeeId.includes(query)
        );
      });
    }

    return result;
  }, [transactions, filter, search]);

  return (
    <>
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Transaction History
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          All transactions analyzed by the risk system
        </p>
      </div>

      {/* Toolbar */}
      <div
        className="
          mb-6
          flex flex-col gap-4
          rounded-2xl
          border border-[var(--color-border)]
          bg-[var(--color-surface-1)]
          p-4
          shadow-sm
          lg:flex-row lg:items-center lg:justify-between
        "
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`
                rounded-lg
                px-4 py-2
                text-sm font-semibold
                transition-all duration-200
                ${
                  filter === item.key
                    ? 'bg-[var(--color-brand)] text-white shadow-md shadow-blue-500/20'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transaction or payee..."
            className="
              w-full
              rounded-xl
              border border-[var(--color-border)]
              bg-[var(--color-surface-2)]
              py-2.5 pl-10 pr-4
              text-sm
              text-[var(--color-text-primary)]
              outline-none
              transition
              placeholder:text-[var(--color-text-muted)]
              focus:border-[var(--color-brand)]
              focus:ring-4
              focus:ring-blue-500/10
            "
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <div>
              <p className="font-semibold">
                Unable to load transactions
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result summary */}
      {!loading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Showing{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {filtered.length}
            </span>{' '}
            transaction{filtered.length !== 1 ? 's' : ''}
          </p>

          {(filter !== 'ALL' || search) && (
            <button
              type="button"
              onClick={() => {
                setFilter('ALL');
                setSearch('');
              }}
              className="text-sm font-semibold text-[var(--color-brand)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div
          className="
            rounded-2xl
            border border-[var(--color-border)]
            bg-[var(--color-surface-1)]
            p-14
            text-center
            shadow-sm
          "
        >
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand)]" />

          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Loading transaction history...
          </p>
        </div>
      ) : (
        <TransactionTable
          transactions={filtered}
          emptyMessage={
            transactions.length === 0
              ? 'No transactions yet — make your first transaction to see it here.'
              : 'No transactions match this filter or search.'
          }
        />
      )}
    </>
  );
}