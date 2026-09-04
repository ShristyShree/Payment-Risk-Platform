const transactionService = require('../services/transactionService');
const ApiError = require('../utils/ApiError');
const { validateTransactionInput } = require('../utils/validators');

/**
 * POST /api/transactions
 * Customer-only (enforced by route middleware).
 *
 * Stage 10:
 * - Transaction service performs ML prediction
 * - Risk tier is calculated
 * - Risk factors are generated
 * - Intervention decision is made
 *
 * The controller only validates input, calls the service,
 * and returns the result.
 */
async function create(req, res) {
  const errors = validateTransactionInput(req.body);

  if (errors.length > 0) {
    throw new ApiError(400, errors.join('; '));
  }

  const idempotencyKey = req.headers['idempotency-key'];

  const {
    transaction,
    idempotent,
    features,
    prediction,
    riskTier,
    riskFactors,
    intervention,
    status,
  } = await transactionService.createTransaction(
    req.user.id,
    req.body,
    idempotencyKey
  );

  res.status(idempotent ? 200 : 201).json({
    transaction,
    idempotent,
    features,
    prediction,
    riskTier,
    riskFactors,
    intervention,
    status,
  });
}

/**
 * GET /api/transactions
 *
 * Customers see only their own transactions.
 * Analysts see all transactions, capped at 200 most recent.
 */
async function list(req, res) {
  const transactions =
    req.user.role === 'analyst'
      ? await transactionService.listAllTransactions()
      : await transactionService.listTransactionsForCustomer(req.user.id);

  res.status(200).json({ transactions });
}

/**
 * GET /api/transactions/:id
 *
 * A customer may only view their own transaction.
 * An analyst may view any transaction.
 */
async function getById(req, res) {
  const transaction = await transactionService.getTransactionById(
    req.params.id
  );

  const isOwner =
    transaction.customerId.toString() === req.user.id;

  if (req.user.role !== 'analyst' && !isOwner) {
    throw new ApiError(
      403,
      'You do not have permission to view this transaction'
    );
  }

  res.status(200).json({ transaction });
}

module.exports = {
  create,
  list,
  getById,
};