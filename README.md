# Social Network Influence Prediction System

A complete full-stack application for predicting social media influence using Machine Learning.

## Features
- **Auth**: JWT Authentication with RBAC (Admin, Analyst, Viewer).
- **ML**: Preprocessing, Normalization, and Training comparison (Logistic Regression / Random Forest).
- **UI**: Modern Next.js Dashboard with Glassmorphism and Recharts.
- **Analytics**: Accuracy, Precision, Recall, and Influence Scoring.

## Installation

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python generate_dummy_data.py  # Create a sample dataset
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials
- Use the **Register** page to create your accounts.
- Roles: `admin`, `analyst`, `viewer`.

## Workflow
1. **Login** or **Register**.
2. Go to **Datasets** and upload `sample_dataset.csv`.
3. Go to **ML Training** and click "Start Training Pipeline".
4. Check the **Dashboard** for model performance.
5. Use the **Influence Prediction** page to analyze specific user metrics.
