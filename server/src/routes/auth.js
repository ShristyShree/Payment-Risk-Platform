const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// Protected: proves the authenticate middleware works end-to-end.
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;