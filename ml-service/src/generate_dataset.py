"""
generate_dataset.py — Synthetic transaction dataset for the payment
risk-scoring model.

EDUCATIONAL / SIMULATED DATA ONLY.

The dataset contains 10,000 transactions with approximately 5% suspicious
transactions.

The features intentionally overlap between legitimate and suspicious
transactions. Suspicious transactions are MORE LIKELY to show unusual
behavior, but legitimate customers can also have new payees, new devices,
location changes, unusual hours, larger payments, etc.

This prevents the ML problem from becoming artificially easy.

Features:
- amount
- amount_deviation
- new_payee
- transaction_velocity
- unusual_hour
- location_change
- new_device
- suspicious (target)
"""

import numpy as np
import pandas as pd
from pathlib import Path


RANDOM_SEED = 42

N_ROWS = 10000
SUSPICIOUS_RATE = 0.05

BASELINE_AMOUNT_MIN = 500
BASELINE_AMOUNT_MAX = 5000


# -------------------------------------------------------------------
# Behavioral probabilities
#
# These are deliberately closer together than the previous version.
# A suspicious transaction is more likely to trigger a signal, but
# legitimate transactions can trigger the same signal too.
# -------------------------------------------------------------------

FEATURE_PROBABILITIES = {

    "new_payee": {
        "legitimate": 0.10,
        "suspicious": 0.35,
    },

    "unusual_hour": {
        "legitimate": 0.10,
        "suspicious": 0.30,
    },

    "location_change": {
        "legitimate": 0.08,
        "suspicious": 0.28,
    },

    "new_device": {
        "legitimate": 0.08,
        "suspicious": 0.25,
    },
}


# -------------------------------------------------------------------
# Transaction velocity
#
# Suspicious transactions are more likely to happen rapidly, but
# legitimate users can also make several transactions close together.
# -------------------------------------------------------------------

VELOCITY_VALUES = [0, 1, 2, 3, 4, 5, 6, 7]

VELOCITY_DIST = {

    "legitimate": [
        0.45,  # 0
        0.25,  # 1
        0.14,  # 2
        0.08,  # 3
        0.04,  # 4
        0.02,  # 5
        0.01,  # 6
        0.01,  # 7
    ],

    "suspicious": [
        0.18,  # 0
        0.17,  # 1
        0.18,  # 2
        0.17,  # 3
        0.12,  # 4
        0.09,  # 5
        0.06,  # 6
        0.03,  # 7
    ],
}


# -------------------------------------------------------------------
# Amount generation
#
# Previous version separated suspicious amounts too strongly.
# Here there is significant overlap.
#
# Legitimate:
#   Most payments are near normal spending.
#   Some legitimate transactions are large.
#
# Suspicious:
#   Some are subtle and look almost normal.
#   Some are moderately elevated.
#   A smaller portion are very large.
# -------------------------------------------------------------------

def generate_amount(
    rng: np.random.Generator,
    baseline: float,
    suspicious: bool,
) -> float:

    if not suspicious:

        choice = rng.random()

        # Normal everyday payment
        if choice < 0.75:
            multiplier = max(
                rng.normal(1.0, 0.22),
                0.10
            )

        # Legitimate larger purchase
        elif choice < 0.95:
            multiplier = rng.uniform(1.3, 3.0)

        # Occasional unusually large legitimate payment
        else:
            multiplier = rng.uniform(2.5, 5.0)

    else:

        choice = rng.random()

        # Subtle suspicious transaction
        if choice < 0.40:
            multiplier = rng.uniform(1.1, 2.0)

        # Moderately unusual suspicious transaction
        elif choice < 0.80:
            multiplier = rng.uniform(1.5, 4.0)

        # Strong amount anomaly
        else:
            multiplier = rng.uniform(3.0, 10.0)

    return round(baseline * multiplier, 2)


# -------------------------------------------------------------------
# Generate one transaction
# -------------------------------------------------------------------

def generate_row(
    rng: np.random.Generator,
    suspicious: bool,
) -> dict:

    # Customer's normal spending baseline
    baseline = rng.uniform(
        BASELINE_AMOUNT_MIN,
        BASELINE_AMOUNT_MAX
    )

    amount = generate_amount(
        rng,
        baseline,
        suspicious
    )

    # Same formula used by the Node.js feature engineering layer.
    amount_deviation = (
        (amount - baseline) / baseline
    )

    label_key = (
        "suspicious"
        if suspicious
        else "legitimate"
    )

    new_payee = int(
        rng.random()
        < FEATURE_PROBABILITIES["new_payee"][label_key]
    )

    unusual_hour = int(
        rng.random()
        < FEATURE_PROBABILITIES["unusual_hour"][label_key]
    )

    location_change = int(
        rng.random()
        < FEATURE_PROBABILITIES["location_change"][label_key]
    )

    new_device = int(
        rng.random()
        < FEATURE_PROBABILITIES["new_device"][label_key]
    )

    transaction_velocity = int(
        rng.choice(
            VELOCITY_VALUES,
            p=VELOCITY_DIST[label_key]
        )
    )

    return {
        "amount": amount,
        "amount_deviation": round(amount_deviation, 4),
        "new_payee": new_payee,
        "transaction_velocity": transaction_velocity,
        "unusual_hour": unusual_hour,
        "location_change": location_change,
        "new_device": new_device,
        "suspicious": int(suspicious),
    }


# -------------------------------------------------------------------
# Generate complete dataset
# -------------------------------------------------------------------

def generate_dataset(
    n_rows: int = N_ROWS,
    suspicious_rate: float = SUSPICIOUS_RATE,
) -> pd.DataFrame:

    rng = np.random.default_rng(RANDOM_SEED)

    n_suspicious = int(
        round(n_rows * suspicious_rate)
    )

    n_legitimate = (
        n_rows - n_suspicious
    )

    rows = []

    # Legitimate transactions
    for _ in range(n_legitimate):
        rows.append(
            generate_row(
                rng,
                suspicious=False
            )
        )

    # Suspicious transactions
    for _ in range(n_suspicious):
        rows.append(
            generate_row(
                rng,
                suspicious=True
            )
        )

    df = pd.DataFrame(rows)

    # Shuffle the dataset so legitimate and suspicious records are
    # not stored in separate blocks.
    df = (
        df.sample(
            frac=1,
            random_state=RANDOM_SEED
        )
        .reset_index(drop=True)
    )

    return df


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------

if __name__ == "__main__":

    df = generate_dataset()

    output_dir = (
        Path(__file__).resolve().parent.parent / "data"
    )

    output_dir.mkdir(
        exist_ok=True
    )

    output_path = (
        output_dir / "transactions.csv"
    )

    df.to_csv(
        output_path,
        index=False
    )

    print(
        f"Generated {len(df)} rows -> {output_path}"
    )

    print("\nClass balance:")

    print(
        df["suspicious"]
        .value_counts(normalize=True)
        .sort_index()
    )

    print("\nSuspicious transaction count:")
    print(
        df["suspicious"].sum()
    )

    print("\nFeature averages by class:")
    print(
        df.groupby("suspicious")[
            [
                "amount",
                "amount_deviation",
                "new_payee",
                "transaction_velocity",
                "unusual_hour",
                "location_change",
                "new_device",
            ]
        ].mean().round(3)
    )