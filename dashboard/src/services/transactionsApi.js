import api from './api';

/**
 * Matches the real transaction endpoints exactly as confirmed from the
 * backend's transactionController.js:
 *   POST /api/transactions  -> { transaction, idempotent, features, prediction, riskTier, riskFactors, intervention, status }
 *   GET  /api/transactions  -> { transactions: [...] }
 *   GET  /api/transactions/:id -> { transaction }
 *
 * NOTE: on the stored `transaction` document itself, only riskScore,
 * riskTier, riskFactors, intervention, and status are known to persist
 * (they're real fields on the Transaction schema). The extra `features`
 * and `prediction` objects only appear in the CREATE response — they are
 * NOT guaranteed to be present when re-fetching a transaction later via
 * GET. Pages that render this data account for that (see
 * TransactionDetails.jsx).
 */

export async function createTransaction(payload, idempotencyKey) {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
  const { data } = await api.post('/transactions', payload, { headers });
  return data;
}

export async function listTransactions() {
  const { data } = await api.get('/transactions');
  return data.transactions;
}

export async function getTransactionById(id) {
  const { data } = await api.get(`/transactions/${id}`);
  return data.transaction;
}