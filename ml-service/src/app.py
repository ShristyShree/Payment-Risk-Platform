"""
app.py — FastAPI service exposing the trained risk model.

Deliberately minimal, per the project's architecture (Stage 1): this
service's ONLY job is "given features, return a probability." It does
not touch MongoDB, does not compute risk scores or tiers, does not
decide interventions — all of that is the Node.js backend's
responsibility (Stages 8-10). Keeping this service single-purpose means
it can be redeployed/retrained independently of the rest of the system.
"""

import json
from pathlib import Path
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException

from schemas import TransactionFeatures, PredictionResponse

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "model.joblib"
METRICS_PATH = Path(__file__).resolve().parent.parent / "models" / "metrics.json"

# Loaded once at startup, not per-request — reloading a model from disk
# on every prediction would be needlessly slow.
_model = None
_model_name = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _model_name
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"No trained model found at {MODEL_PATH}. Run `python train.py` first."
        )
    _model = joblib.load(MODEL_PATH)

    if METRICS_PATH.exists():
        with open(METRICS_PATH) as f:
            _model_name = json.load(f).get("selected_model", "unknown")
    else:
        _model_name = "unknown"

    yield
    # No teardown needed — nothing to release.


app = FastAPI(
    title="Payment Risk ML Service",
    description="Educational/simulated risk-prediction service. Not a real fraud-detection product.",
    lifespan=lifespan,
)

# Column order must exactly match what the model was trained on
# (train.py FEATURE_COLUMNS) — scikit-learn models predict on column
# POSITION, not name, so getting this order wrong would silently produce
# meaningless predictions rather than an obvious error.
FEATURE_COLUMNS = [
    "amount",
    "amount_deviation",
    "new_payee",
    "transaction_velocity",
    "unusual_hour",
    "location_change",
    "new_device",
]


@app.get("/health")
def health():
    return {"status": "running", "model_loaded": _model is not None, "model_used": _model_name}


@app.post("/predict", response_model=PredictionResponse)
def predict(features: TransactionFeatures):
    if _model is None:
        # Defensive — lifespan should guarantee this never happens, but
        # fail clearly rather than silently if it somehow does.
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Booleans -> ints, since that's what the model was trained on
    # (generate_dataset.py stores new_payee/unusual_hour/etc. as 0/1).
    row = {
        "amount": features.amount,
        "amount_deviation": features.amount_deviation,
        "new_payee": int(features.new_payee),
        "transaction_velocity": features.transaction_velocity,
        "unusual_hour": int(features.unusual_hour),
        "location_change": int(features.location_change),
        "new_device": int(features.new_device),
    }
    X = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    probability = float(_model.predict_proba(X)[0][1])  # probability of class 1 (suspicious)

    return PredictionResponse(probability=probability, model_used=_model_name)