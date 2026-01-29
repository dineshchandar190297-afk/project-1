import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

class InfluencePredictor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.le = LabelEncoder()
        self.best_model = None
        self.model_path = "models_storage/best_model.joblib"
        self.scaler_path = "models_storage/scaler.joblib"

    def preprocess_data(self, df: pd.DataFrame):
        # Normalize column names
        df.columns = [c.lower().strip().replace(' ', '_') for c in df.columns]
        
        # Robust fuzzy mapping - avoid duplicates
        mapping = {}
        targets_found = set()
        for col in df.columns:
            target = None
            if 'follower' in col or 'sub' in col or 'friend' in col: 
                target = 'followers'
            elif 'like' in col or 'view' in col or 'received' in col: 
                target = 'likes'
            elif 'share' in col or 'retweet' in col: 
                target = 'shares'
            elif 'comment' in col: 
                target = 'comments'
            elif 'performance' in col or 'influence' in col or 'label' in col:
                target = 'influence_label'
            
            if target and target not in targets_found:
                mapping[col] = target
                targets_found.add(target)
        
        df = df.rename(columns=mapping)

        # Ensure required columns exist and are numeric
        required = ['followers', 'likes', 'shares', 'comments']
        for col in required:
            if col not in df.columns:
                df[col] = 0
            # Ensure we are dealing with a Series (in case of previous duplicates)
            column_data = df[col]
            if isinstance(column_data, pd.DataFrame):
                column_data = column_data.iloc[:, 0]
            df[col] = pd.to_numeric(column_data, errors='coerce').fillna(0)
        
        # Feature Extraction: Engagement Rate
        df['engagement_rate'] = (df['likes'] + df['shares'] + df['comments']) / (df['followers'] + 1)
        
        # Target column: influence_label
        if 'influence_label' in df.columns:
            label_data = df['influence_label']
            if isinstance(label_data, pd.DataFrame):
                label_data = label_data.iloc[:, 0]
            
            # Normalize labels
            df['influence_label'] = label_data.astype(str).str.strip().str.capitalize()
            df['influence_label'] = df['influence_label'].replace({'Viral': 'High'})
            
            valid_labels = ['High', 'Medium', 'Low']
            df.loc[~df['influence_label'].isin(valid_labels), 'influence_label'] = 'Low'
        else:
            # Generate labels based on followers
            conditions = [
                (df['followers'] > 100000),
                (df['followers'] > 10000) & (df['followers'] <= 100000),
                (df['followers'] <= 10000)
            ]
            choices = ['High', 'Medium', 'Low']
            df['influence_label'] = np.select(conditions, choices, default='Low')
            
            # If the fixed thresholds resulted in no diversity (only 1 unique label),
            # use quantiles (relative ranking) instead so we can still train.
            if len(df['influence_label'].unique()) < 2:
                q33 = df['followers'].quantile(0.33)
                q66 = df['followers'].quantile(0.66)
                
                # Check if quantiles are distinct
                if q33 == q66 or q66 == df['followers'].max():
                    # If still not diverse (e.g. all follower counts are identical), add tiny noise
                    df['followers_rank'] = df['followers'] + np.random.normal(0, 0.01, size=len(df))
                    q33 = df['followers_rank'].quantile(0.33)
                    q66 = df['followers_rank'].quantile(0.66)
                    val_col = 'followers_rank'
                else:
                    val_col = 'followers'
                
                conditions = [
                    (df[val_col] >= q66),
                    (df[val_col] >= q33) & (df[val_col] < q66),
                    (df[val_col] < q33)
                ]
                df['influence_label'] = np.select(conditions, choices, default='Low')
                if 'followers_rank' in df.columns:
                    df = df.drop(columns=['followers_rank'])

        # Filter to only the columns we need for training to avoid any remaining junk
        final_cols = ['followers', 'likes', 'shares', 'comments', 'engagement_rate', 'influence_label']
        df = df[final_cols]
        df = df.dropna()
        
        return df

    def train(self, df: pd.DataFrame):
        try:
            df = self.preprocess_data(df)
            
            X = df[['followers', 'likes', 'shares', 'comments', 'engagement_rate']]
            y = self.le.fit_transform(df['influence_label'])
            
            if len(df) < 5:
                raise ValueError("Not enough data to train. Please upload more records (at least 5).")

            unique_classes = np.unique(y)
            if len(unique_classes) < 2:
                # Fallback: If only one class is present (e.g., all Low), we can't train a classifier.
                # But for the sake of the demo not throwing a 500, we'll return a special message.
                raise ValueError("The dataset lacks diversity (only one influence level found). Please upload more varied data.")

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
            
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Models
            models = {
                "Logistic Regression": LogisticRegression(max_iter=1000),
                "Random Forest": RandomForestClassifier(n_estimators=100)
            }
            
            results = []
            best_f1 = -1
            
            for name, model in models.items():
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                metrics = {
                    "model_name": name,
                    "accuracy": accuracy_score(y_test, y_pred),
                    "precision": precision_score(y_test, y_pred, average='weighted'),
                    "recall": recall_score(y_test, y_pred, average='weighted'),
                    "f1_score": f1_score(y_test, y_pred, average='weighted')
                }
                results.append(metrics)
                
                if metrics["f1_score"] > best_f1:
                    best_f1 = metrics["f1_score"]
                    self.best_model = model
            
            # Save best model and scaler
            os.makedirs("models_storage", exist_ok=True)
            joblib.dump(self.best_model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.le, "models_storage/label_encoder.joblib")
            
            return results
        except Exception as e:
            print(f"Training error: {str(e)}")
            raise Exception(f"ML Training Error: {str(e)}")

    def predict(self, data: dict):
        if not os.path.exists(self.model_path):
            raise Exception("Model not trained yet")
            
        model = joblib.load(self.model_path)
        scaler = joblib.load(self.scaler_path)
        le = joblib.load("models_storage/label_encoder.joblib")
        
        # Calculate engagement rate
        engagement_rate = (data['likes'] + data['shares'] + data['comments']) / data['followers']
        
        features = np.array([[
            data['followers'], 
            data['likes'], 
            data['shares'], 
            data['comments'], 
            engagement_rate
        ]])
        
        features_scaled = scaler.transform(features)
        prediction_idx = model.predict(features_scaled)[0]
        prediction_label = le.inverse_transform([prediction_idx])[0]
        
        # Score calculation (normalized 0-100)
        # Simple heuristic: log10(followers) * engagement_rate
        score = np.log10(data['followers'] + 1) * (engagement_rate * 10)
        score = min(100, max(0, score))
        
        return {
            "influence_level": prediction_label,
            "influence_score": round(score, 2)
        }
