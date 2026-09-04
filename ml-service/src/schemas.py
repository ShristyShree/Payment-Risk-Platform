"""
schemas.py — Request/response shapes for the ML prediction API.

Using Pydantic models (not raw dicts) gets us automatic request
validation for free — a malformed request (wrong type, missing field)
is rejected by FastAPI before our prediction code ever runs, with a
clear 422 error explaining exactly what was wrong. This is one of the
concrete reasons FastAPI was chosen over Flask for this service.
"""

from pydantic import BaseModel, Field


class TransactionFeatures(BaseModel):
    """
    Mirrors the exact feature set produced by the Node.js
    feature-engineering layer (Stage 6) and the columns the model was
    trained on (see train.py FEATURE_COLUMNS). The two must stay in sync —
    this is the contract between the Node backend and this service.
    """

    amount: float = Field(..., gt=0, description="Transaction amount")
    amount_deviation: float = Field(
        ..., description="(amount - customer's typical amount) / typical amount"
    )
    new_payee: bool = Field(..., description="Whether this payee is new to the customer")
    transaction_velocity: int = Field(
        ..., ge=0, description="Number of this customer's transactions in the preceding 5 minutes"
    )
    unusual_hour: bool = Field(..., description="Whether this hour is atypical for the customer")
    location_change: bool = Field(..., description="Whether the location differs from normal")
    new_device: bool = Field(..., description="Whether this device is new to the customer")


class PredictionResponse(BaseModel):
    """
    Deliberately returns ONLY a probability, not a risk score or tier —
    per the project's architecture (Stage 1/9), turning a raw ML
    probability into a 0-100 explainable risk score with named
    contributing factors is the Node.js risk-scoring engine's job
    (Stage 9), not this service's. This keeps the ML service a pure,
    single-purpose prediction endpoint.
    """

    probability: float = Field(..., ge=0, le=1, description="Model's predicted probability of being suspicious")
    model_used: str