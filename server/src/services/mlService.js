const axios = require('axios');
const ApiError = require('../utils/ApiError');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends engineered transaction features to the Python ML service
 * and returns the model prediction.
 *
 * Stage 8 responsibility:
 * - communicate with Flask
 * - send the 7 engineered features
 * - validate the ML response
 *
 * Risk tiers and intervention decisions are intentionally NOT handled here.
 */
async function predictRisk(features) {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      {
        amount: features.amount,
        amount_deviation: features.amount_deviation,
        new_payee: Number(features.new_payee),
        transaction_velocity: features.transaction_velocity,
        unusual_hour: Number(features.unusual_hour),
        location_change: Number(features.location_change),
        new_device: Number(features.new_device),
      },
      {
        timeout: 5000,
      }
    );

    const prediction = response.data;

    // Make sure the ML service returned the fields we expect.
    if (
      typeof prediction.probability !== 'number' ||
      typeof prediction.riskScore !== 'number' ||
      typeof prediction.suspicious !== 'boolean'
    ) {
      throw new Error('ML service returned an invalid prediction');
    }

    return {
      probability: prediction.probability,
      riskScore: prediction.riskScore,
      suspicious: prediction.suspicious,
      threshold: prediction.threshold,
    };
  } catch (error) {
    // If Flask itself returned an error, preserve a useful message.
    if (error.response) {
      throw new ApiError(
        502,
        `ML service error: ${
          error.response.data?.error || 'prediction failed'
        }`
      );
    }

    // Timeout / connection refused / Flask not running.
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED') {
      throw new ApiError(
        503,
        'ML service is unavailable'
      );
    }

    // Don't expose internal Axios/network details to the client.
    throw new ApiError(
      502,
      'Failed to get prediction from ML service'
    );
  }
}

module.exports = {
  predictRisk,
};