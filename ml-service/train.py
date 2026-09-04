"""
train.py — Train and evaluate payment risk models.

ML pipeline:

    Synthetic Dataset
          |
          v
    70% Training Data
          |
          v
    Train Models
          |
          v
    15% Validation Data
          |
          v
    Select Model + Threshold
          |
          v
    15% Untouched Test Data
          |
          v
    Final Evaluation

Models:
- Logistic Regression
- Random Forest

The dataset is synthetic and intended for educational/project use only.

Why F1?
--------
Suspicious transactions represent approximately 5% of the dataset.

Accuracy alone would be misleading because a model predicting every
transaction as legitimate would achieve approximately 95% accuracy
while detecting no suspicious transactions.

Therefore we evaluate:

- Precision
- Recall
- F1-score
- ROC-AUC
- Confusion matrix

Threshold selection:
--------------------
The model outputs a probability that a transaction is suspicious.

The validation set is used to choose the probability threshold.

The final test set is NOT used during threshold selection.

This provides a cleaner estimate of how the selected model performs
on previously unseen data.
"""

import json
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from sklearn.model_selection import train_test_split


# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

RANDOM_SEED = 42

# Final split:
#
# 70% training
# 15% validation
# 15% test
#
# We first split 70/30.
# Then split the remaining 30% equally into validation and test.
TRAIN_SIZE = 0.70
VALIDATION_SIZE = 0.15
TEST_SIZE = 0.15

# Thresholds evaluated on validation data.
THRESHOLDS = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60]


# -------------------------------------------------------------------
# Features
# -------------------------------------------------------------------

FEATURE_COLUMNS = [
    "amount",
    "amount_deviation",
    "new_payee",
    "transaction_velocity",
    "unusual_hour",
    "location_change",
    "new_device",
]

LABEL_COLUMN = "suspicious"


# -------------------------------------------------------------------
# Load dataset
# -------------------------------------------------------------------

def load_data():
    """
    Load the generated transaction dataset.
    """

    data_path = (
        Path(__file__).resolve().parent
        / "data"
        / "transactions.csv"
    )

    if not data_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {data_path}\n"
            "Run generate_dataset.py first."
        )

    df = pd.read_csv(data_path)

    required_columns = FEATURE_COLUMNS + [LABEL_COLUMN]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Dataset is missing columns: {missing_columns}"
        )

    X = df[FEATURE_COLUMNS]
    y = df[LABEL_COLUMN]

    return X, y


# -------------------------------------------------------------------
# Evaluate model
# -------------------------------------------------------------------

def evaluate(model, X, y, threshold=0.5):
    """
    Evaluate a trained model using a probability threshold.

    The model outputs a probability for the suspicious class.

    Example:

        probability = 0.72
        threshold = 0.40

        0.72 >= 0.40
        therefore → suspicious
    """

    # Probability of class 1 = suspicious
    probabilities = model.predict_proba(X)[:, 1]

    # Convert probability into binary prediction
    predictions = (
        probabilities >= threshold
    ).astype(int)

    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(
        y,
        predictions,
    ).ravel()

    precision = precision_score(
        y,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y,
        predictions,
        zero_division=0,
    )

    roc_auc = roc_auc_score(
        y,
        probabilities,
    )

    return {
        "threshold": threshold,

        "precision": round(
            precision,
            4,
        ),

        "recall": round(
            recall,
            4,
        ),

        "f1": round(
            f1,
            4,
        ),

        "roc_auc": round(
            roc_auc,
            4,
        ),

        "confusion_matrix": {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp),
        },
    }


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------

def main():

    # ===============================================================
    # 1. Load dataset
    # ===============================================================

    X, y = load_data()

    print(
        f"Total dataset size: {len(X)}"
    )

    print(
        f"Total suspicious transactions: "
        f"{int(y.sum())}"
    )

    print(
        f"Overall suspicious rate: "
        f"{y.mean():.4f}\n"
    )


    # ===============================================================
    # 2. Create Train / Validation / Test split
    # ===============================================================

    # First:
    #
    # 70% → train
    # 30% → temporary set
    #
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=(VALIDATION_SIZE + TEST_SIZE),
        stratify=y,
        random_state=RANDOM_SEED,
    )

    # The temporary 30% is split equally:
    #
    # 15% → validation
    # 15% → test
    #
    X_validation, X_test, y_validation, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        stratify=y_temp,
        random_state=RANDOM_SEED,
    )


    print("Dataset split:")
    print(
        f"  Training:   {len(X_train)} "
        f"({len(X_train) / len(X) * 100:.0f}%)"
    )

    print(
        f"  Validation: {len(X_validation)} "
        f"({len(X_validation) / len(X) * 100:.0f}%)"
    )

    print(
        f"  Test:       {len(X_test)} "
        f"({len(X_test) / len(X) * 100:.0f}%)"
    )

    print()

    print(
        f"Training suspicious rate: "
        f"{y_train.mean():.4f}"
    )

    print(
        f"Validation suspicious rate: "
        f"{y_validation.mean():.4f}"
    )

    print(
        f"Test suspicious rate: "
        f"{y_test.mean():.4f}"
    )

    print()


    # ===============================================================
    # 3. Define models
    # ===============================================================

    models = {

        "logistic_regression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=RANDOM_SEED,
        ),

        "random_forest": RandomForestClassifier(
            class_weight="balanced",
            n_estimators=200,
            random_state=RANDOM_SEED,
        ),
    }


    # ===============================================================
    # 4. Train models
    # ===============================================================

    trained_models = {}

    for name, model in models.items():

        print(
            f"Training {name}..."
        )

        model.fit(
            X_train,
            y_train,
        )

        trained_models[name] = model

    print()


    # ===============================================================
    # 5. Use VALIDATION set to select model + threshold
    # ===============================================================

    print(
        "========================================"
    )

    print(
        "VALIDATION RESULTS"
    )

    print(
        "========================================"
    )

    validation_results = {}

    for name, model in trained_models.items():

        print(
            f"\n--- {name} ---"
        )

        threshold_results = {}

        for threshold in THRESHOLDS:

            metrics = evaluate(
                model,
                X_validation,
                y_validation,
                threshold,
            )

            threshold_results[
                str(threshold)
            ] = metrics

            print(
                f"  threshold={threshold:.2f} | "
                f"precision={metrics['precision']:.4f} | "
                f"recall={metrics['recall']:.4f} | "
                f"f1={metrics['f1']:.4f}"
            )

        validation_results[name] = (
            threshold_results
        )


    # ===============================================================
    # 6. Select best model + threshold
    #
    # IMPORTANT:
    # The test set has NOT been touched yet.
    # ===============================================================

    best_name = None
    best_threshold = None
    best_validation_metrics = None

    for name, threshold_results in validation_results.items():

        for threshold, metrics in threshold_results.items():

            if (
                best_validation_metrics is None
                or metrics["f1"]
                > best_validation_metrics["f1"]
            ):

                best_name = name

                best_threshold = float(
                    threshold
                )

                best_validation_metrics = metrics


    best_model = trained_models[
        best_name
    ]


    print(
        "\n========================================"
    )

    print(
        "SELECTED MODEL"
    )

    print(
        "========================================"
    )

    print(
        f"Model: {best_name}"
    )

    print(
        f"Threshold: {best_threshold:.2f}"
    )

    print(
        f"Validation F1: "
        f"{best_validation_metrics['f1']:.4f}"
    )

    print()


    # ===============================================================
    # 7. FINAL evaluation on untouched TEST set
    # ===============================================================

    print(
        "========================================"
    )

    print(
        "FINAL TEST RESULTS"
    )

    print(
        "========================================"
    )

    final_metrics = evaluate(
        best_model,
        X_test,
        y_test,
        best_threshold,
    )


    print(
        f"Precision: "
        f"{final_metrics['precision']:.4f}"
    )

    print(
        f"Recall: "
        f"{final_metrics['recall']:.4f}"
    )

    print(
        f"F1: "
        f"{final_metrics['f1']:.4f}"
    )

    print(
        f"ROC-AUC: "
        f"{final_metrics['roc_auc']:.4f}"
    )

    print()

    print(
        "Confusion Matrix:"
    )

    print(
        f"  True Negatives:  "
        f"{final_metrics['confusion_matrix']['true_negative']}"
    )

    print(
        f"  False Positives: "
        f"{final_metrics['confusion_matrix']['false_positive']}"
    )

    print(
        f"  False Negatives: "
        f"{final_metrics['confusion_matrix']['false_negative']}"
    )

    print(
        f"  True Positives:  "
        f"{final_metrics['confusion_matrix']['true_positive']}"
    )


    # ===============================================================
    # 8. Save model
    # ===============================================================

    models_dir = (
        Path(__file__).resolve().parent
        / "models"
    )

    models_dir.mkdir(
        exist_ok=True
    )

    model_path = (
        models_dir / "model.joblib"
    )

    joblib.dump(
        best_model,
        model_path,
    )

    print(
        f"\nSaved model -> {model_path}"
    )


    # ===============================================================
    # 9. Save metrics
    # ===============================================================

    metrics_output = {

        "selected_model": best_name,

        "selected_threshold": best_threshold,

        "feature_columns": FEATURE_COLUMNS,

        "dataset": {
            "total_rows": len(X),
            "suspicious_rows": int(y.sum()),
            "suspicious_rate": round(
                float(y.mean()),
                4,
            ),
        },

        "split": {
            "train_rows": len(X_train),
            "validation_rows": len(X_validation),
            "test_rows": len(X_test),
        },

        "validation_results": validation_results,

        "final_test_results": final_metrics,
    }


    metrics_path = (
        models_dir / "metrics.json"
    )

    with open(
        metrics_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            metrics_output,
            f,
            indent=2,
        )


    print(
        f"Saved metrics -> {metrics_path}"
    )


# -------------------------------------------------------------------
# Entry point
# -------------------------------------------------------------------

if __name__ == "__main__":
    main()