# 💳 Payment Risk Intelligence Platform

A full-stack **Payment Risk Intelligence Platform** that analyzes financial transactions using **Machine Learning** and backend risk-assessment logic to identify potentially suspicious transactions in real time.

The platform allows customers to create transactions and view their transaction history, while analysts can monitor and analyze transactions across the system.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control
- Customer and Analyst roles
- Protected API routes
- Customers can access only their own transactions
- Analysts can view transactions across the platform

### 💸 Transaction Management
- Create new transactions
- View transaction history
- View detailed transaction information
- Transaction ownership validation
- Idempotency support to prevent duplicate transactions
- Transaction status tracking

### 🤖 Machine Learning Risk Detection
Each transaction is processed through an ML service using engineered transaction features such as:

- Transaction amount
- Amount deviation from typical spending
- New payee detection
- Transaction velocity
- Unusual transaction hour
- Location change
- New device detection

The ML service returns:

- Suspicious probability
- Risk score
- Suspicious/normal prediction
- Model threshold

### ⚠️ Risk Assessment

Transactions are categorized into risk tiers:

| Risk Tier | Meaning |
|-----------|---------|
| LOW | Low-risk transaction |
| MEDIUM | Elevated but manageable risk |
| HIGH | High-risk transaction requiring attention |
| CRITICAL | Critical-risk transaction |

The platform also generates risk factors explaining why a transaction received its risk score.

### 🛡️ Intervention System

Based on the transaction risk, the system can take different actions:

| Intervention | Description |
|--------------|-------------|
| NONE | Transaction is allowed normally |
| WARNING | Transaction is allowed with a warning |
| REVIEW | Transaction is flagged for manual review |
| BLOCK | Transaction is blocked |

### 📊 Dashboard
The dashboard provides an overview of transaction activity including:

- Total transactions
- Allowed transactions
- Warned transactions
- Transactions under review
- Blocked transactions
- Recent transactions
- Risk scores
- Risk tiers
- Transaction statuses

### 📋 Transaction Details

Each transaction has a dedicated details page displaying:

- Transaction ID
- Amount
- Payee
- Location
- Device
- Timestamp
- Risk score
- Risk tier
- Transaction status
- Risk factors
- Intervention decision

---

# 🏗️ System Architecture

The application follows a **full-stack + ML microservice architecture**.

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │      React.js       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      Backend        │
                    │ Node.js + Express   │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │    MongoDB      │         │   ML Service    │
        │    Database     │         │ Python + Flask  │
        └─────────────────┘         └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   ML Model      │
                                    │ Risk Prediction │
                                    └─────────────────┘
