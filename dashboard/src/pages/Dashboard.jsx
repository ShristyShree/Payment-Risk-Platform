import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";

import { listTransactions } from "../services/transactionsApi";

export default function Dashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const data = await listTransactions();

        if (!cancelled) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.error?.message ||
              err?.response?.data?.message ||
              err?.message ||
              "Could not load transactions from the server."
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

  const counts = transactions.reduce(
    (acc, transaction) => {
      acc.total += 1;

      switch (transaction.status) {
        case "ALLOWED":
          acc.allowed += 1;
          break;

        case "WARNED":
          acc.warned += 1;
          break;

        case "UNDER_REVIEW":
          acc.underReview += 1;
          break;

        case "BLOCKED":
          acc.blocked += 1;
          break;

        default:
          break;
      }

      return acc;
    },
    {
      total: 0,
      allowed: 0,
      warned: 0,
      underReview: 0,
      blocked: 0,
    }
  );

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-8">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />

            <span className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">
              System Online
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Real-time overview of your transaction risk activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/transactions/new")}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-blue-600/20
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-blue-700
            hover:shadow-xl
            hover:shadow-blue-600/25
            active:translate-y-0
          "
        >
          <span className="text-xl leading-none">+</span>
          Make Transaction
        </button>
      </section>


      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            shadow-sm
          "
        >
          <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              !
            </div>

            <div>
              <p className="font-bold text-red-800">
                Unable to load transactions
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

          </div>
        </div>
      )}


      {/* =========================
          STATISTICS
      ========================= */}
      <section>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Transaction Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current transaction activity and risk decisions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            label="Total Transactions"
            value={loading ? "—" : counts.total}
            accent="brand"
          />

          <StatCard
            label="Allowed"
            value={loading ? "—" : counts.allowed}
            accent="low"
          />

          <StatCard
            label="Warned"
            value={loading ? "—" : counts.warned}
            accent="medium"
          />

          <StatCard
            label="Under Review"
            value={loading ? "—" : counts.underReview}
            accent="high"
          />

          <StatCard
            label="Blocked"
            value={loading ? "—" : counts.blocked}
            accent="critical"
          />

        </div>
      </section>


      {/* =========================
          RECENT TRANSACTIONS
      ========================= */}
      <section>

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest payment activity from your account
            </p>
          </div>

          {transactions.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="
                shrink-0
                rounded-lg
                px-3
                py-2
                text-sm
                font-bold
                text-blue-600
                transition
                hover:bg-blue-50
              "
            >
              View all →
            </button>
          )}

        </div>


        {/* LOADING */}
        {loading && (
          <div
            className="
              flex
              min-h-64
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <div
              className="
                mb-4
                h-8
                w-8
                animate-spin
                rounded-full
                border-4
                border-slate-200
                border-t-blue-600
              "
            />

            <p className="text-sm font-medium text-slate-500">
              Loading transactions...
            </p>
          </div>
        )}


        {/* DATA */}
        {!loading && (
          <TransactionTable
            transactions={recentTransactions}
            emptyMessage="No transactions yet. Make your first transaction to see it here."
          />
        )}

      </section>

    </div>
  );
}