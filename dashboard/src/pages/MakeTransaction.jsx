import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskResultPanel from '../components/RiskResultPanel';
import { createTransaction } from '../services/transactionsApi';

const initialForm = {
  amount: '',
  payeeId: '',
  isNewPayee: false,
  location: '',
  deviceId: '',
};

export default function MakeTransaction() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSubmitting(true);
    setResult(null);

    const payload = {
      amount: Number(form.amount),
      payeeId: form.payeeId.trim(),
      isNewPayee: form.isNewPayee,
    };

    if (form.location.trim()) {
      payload.location = form.location.trim();
    }

    if (form.deviceId.trim()) {
      payload.deviceId = form.deviceId.trim();
    }

    try {
      const data = await createTransaction(payload);

      console.log('TRANSACTION RESPONSE:', data);

      setResult(data);
    } catch (err) {
      console.error('TRANSACTION ERROR:', err);

      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Something went wrong submitting this transaction.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setResult(null);
    setError('');
  }

  if (result) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Transaction Analysis
          </h1>

          <p className="mt-2 text-[var(--color-text-secondary)]">
            Your payment has been analyzed by the risk system.
          </p>
        </div>

        <RiskResultPanel
          transaction={result.transaction}
          riskFactors={result.riskFactors}
          intervention={result.intervention}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-sm font-medium rounded-lg py-3 transition-colors"
          >
            Make another transaction
          </button>

          <button
            onClick={() =>
              navigate(`/transactions/${result.transaction._id}`)
            }
            className="flex-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold rounded-lg py-3 transition-colors"
          >
            View full details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">

      {/* PAGE HEADER */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Make Transaction
        </h1>

        <p className="mt-2 text-[var(--color-text-secondary)]">
          Submit a payment and let the risk engine analyze it in real time.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-7 shadow-sm"
      >

        {error && (
          <div className="mb-6 bg-[var(--color-risk-critical-bg)] border border-[var(--color-risk-critical)]/30 text-[var(--color-risk-critical)] text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* AMOUNT */}
          <Field label="Amount (₹)" required>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                updateField('amount', e.target.value)
              }
              placeholder="5000"
              className={inputClass}
            />
          </Field>

          {/* PAYEE */}
          <Field label="Payee ID" required>
            <input
              type="text"
              required
              value={form.payeeId}
              onChange={(e) =>
                updateField('payeeId', e.target.value)
              }
              placeholder="electricity-board"
              className={inputClass}
            />
          </Field>

          {/* LOCATION */}
          <Field label="Location" optional>
            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                updateField('location', e.target.value)
              }
              placeholder="Chennai"
              className={inputClass}
            />
          </Field>

          {/* DEVICE */}
          <Field label="Device ID" optional>
            <input
              type="text"
              value={form.deviceId}
              onChange={(e) =>
                updateField('deviceId', e.target.value)
              }
              placeholder="iphone-15"
              className={inputClass}
            />
          </Field>

        </div>

        {/* NEW PAYEE */}
        <label className="mt-6 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isNewPayee}
            onChange={(e) =>
              updateField('isNewPayee', e.target.checked)
            }
            className="mt-1 w-4 h-4 accent-[var(--color-brand)]"
          />

          <div>
            <div className="text-sm font-medium text-[var(--color-text-primary)]">
              This is a new payee
            </div>

            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              Enable this if you have never paid this recipient before.
            </div>
          </div>
        </label>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-7 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-all"
        >
          {submitting
            ? 'Analyzing transaction…'
            : 'Analyze Transaction'}
        </button>

      </form>

      {/* INFO */}
      <div className="mt-5 grid grid-cols-3 gap-3">

        <InfoCard
          title="Behavior"
          text="Customer and transaction patterns are evaluated."
        />

        <InfoCard
          title="ML Risk"
          text="The ML service generates a risk score."
        />

        <InfoCard
          title="Decision"
          text="The system determines the appropriate action."
        />

      </div>
    </div>
  );
}


const inputClass =
  'w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all';


function Field({ label, required, optional, children }) {
  return (
    <div className="flex flex-col gap-2">

      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}

        {optional && (
          <span className="text-[var(--color-text-muted)] font-normal ml-1">
            (optional)
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


function InfoCard({ title, text }) {
  return (
    <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="text-sm font-semibold text-[var(--color-text-primary)]">
        {title}
      </div>

      <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
        {text}
      </div>
    </div>
  );
}