import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      /*
       * Register through the existing backend API.
       *
       * authApi.register() returns:
       * {
       *   token,
       *   user
       * }
       *
       * We don't have a register() function in AuthContext yet,
       * so registration is handled below through authApi.
       */

      const { register } = await import('../services/authApi');

      const result = await register(name, email, password);

      // Store exactly like normal login
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Go to dashboard
      navigate('/dashboard');
      
      // Reload so AuthContext picks up the newly-created session
      window.location.reload();

    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        'Unable to create account. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center mb-4 shadow-lg">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3Z" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Payment Risk Platform
          </h1>

          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Create your customer account
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-7 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Create account
            </h2>

            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Start monitoring your transaction risk
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-[var(--color-risk-critical-bg)] border border-[var(--color-risk-critical)]/30 text-[var(--color-risk-critical)] text-sm rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter password again"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            {/* Create account */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-3 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}