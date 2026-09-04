from pathlib import Path

import joblib
from flask import Flask, jsonify, request


app = Flask(__name__)

# --------------------------------------------------
# Load trained model
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "model.joblib"

model = joblib.load(MODEL_PATH)

# This is the threshold selected during model evaluation.
# Stage 7 uses the threshold saved/selected by train.py.
PREDICTION_THRESHOLD = 0.35

FEATURE_COLUMNS = [
    "amount",
    "amount_deviation",
    "new_payee",
    "transaction_velocity",
    "unusual_hour",
    "location_change",
    "new_device",
]


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": True
    })


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    # Check that every required feature exists.
    missing_features = [
        feature
        for feature in FEATURE_COLUMNS
        if feature not in data
    ]

    if missing_features:
        return jsonify({
            "error": "Missing required features",
            "missing": missing_features
        }), 400

    try:
        features = [[
            float(data["amount"]),
            float(data["amount_deviation"]),
            int(data["new_payee"]),
            int(data["transaction_velocity"]),
            int(data["unusual_hour"]),
            int(data["location_change"]),
            int(data["new_device"]),
        ]]

        probability = float(model.predict_proba(features)[0][1])

        suspicious = probability >= PREDICTION_THRESHOLD

        risk_score = round(probability * 100, 2)

        return jsonify({
            "suspicious": suspicious,
            "probability": round(probability, 4),
            "riskScore": risk_score,
            "threshold": PREDICTION_THRESHOLD
        })

    except (TypeError, ValueError) as error:
        return jsonify({
            "error": "Invalid feature values",
            "details": str(error)
        }), 400


# --------------------------------------------------
# Start server
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )