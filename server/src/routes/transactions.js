const express = require('express');
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Every route here requires a logged-in user.
router.use(authenticate);

// Only customers create payments — analysts investigate them, they don't
// submit them (an analyst trying to create a "payment" isn't a real
// workflow in this system).
router.post('/', authorize('customer'), asyncHandler(transactionController.create));

// Listing/viewing is open to both roles; the controller itself scopes
// what a customer vs analyst is allowed to see (see transactionController.js).
router.get('/', asyncHandler(transactionController.list));
router.get('/:id', asyncHandler(transactionController.getById));

module.exports = router;