import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Successful login
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        'Unable to sign in. Please check your email and password.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-0)] px-4">
      <div className="w-full max-w-md">

        {/* Logo / Heading */}
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
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Payment Risk Platform
          </h1>

          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Secure transaction risk monitoring
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-7 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Welcome back
            </h2>

            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Sign in to access your account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-[var(--color-risk-critical-bg)] border border-[var(--color-risk-critical)]/30 text-[var(--color-risk-critical)] text-sm rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
                autoFocus
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-3 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Small footer */}
        <p className="text-center text-xs text-[var(--color-text-secondary)] mt-6">
          Your transactions are analyzed for suspicious activity
        </p>
      </div>
    </div>
  );
}