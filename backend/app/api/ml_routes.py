from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import pandas as pd
import os
import shutil
from app.db.session import get_db
from app.models.models import Dataset, ModelMetric, Prediction, User
from app.api.auth import get_current_user
from app.ml.influence_model import InfluencePredictor
from pydantic import BaseModel
from typing import List

router = APIRouter()
predictor = InfluencePredictor()

class PredictionInput(BaseModel):
    followers: int
    likes: int
    shares: int
    comments: int

@router.post("/upload")
def upload_dataset(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    os.makedirs("data", exist_ok=True)
    file_path = f"data/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    db_dataset = Dataset(
        filename=file.filename,
        file_path=file_path,
        uploaded_by=current_user.id
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return {"message": "File uploaded successfully", "dataset_id": db_dataset.id}

@router.post("/train")
def train_model(
    dataset_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = pd.read_csv(dataset.file_path)
        results = predictor.train(df)
        
        # Save metrics to DB
        # Clear old metrics first
        db.query(ModelMetric).delete()
        
        best_f1 = -1
        best_metric_obj = None
        
        for res in results:
            metric = ModelMetric(
                model_name=res["model_name"],
                accuracy=res["accuracy"],
                precision=res["precision"],
                recall=res["recall"],
                f1_score=res["f1_score"],
                is_best=False
            )
            db.add(metric)
            if res["f1_score"] > best_f1:
                best_f1 = res["f1_score"]
                best_metric_obj = metric
                
        if best_metric_obj:
            best_metric_obj.is_best = True
            
        db.commit()
        return {"message": "Model training completed", "metrics": results}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    metrics = db.query(ModelMetric).all()
    return metrics

@router.post("/predict")
def predict_influence(
    input_data: PredictionInput, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        prediction = predictor.predict(input_data.dict())
        
        db_prediction = Prediction(
            input_data=input_data.dict(),
            influence_score=prediction["influence_score"],
            influence_level=prediction["influence_level"],
            predicted_by=current_user.id
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/top-influencers")
def get_top_influencers(db: Session = Depends(get_db)):
    # Return top 10 predictions by score
    predictions = db.query(Prediction).order_by(Prediction.influence_score.desc()).limit(10).all()
    return predictions

@router.get("/predictions-history")
def get_predictions_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all prediction history for the current user
    """
    history = db.query(Prediction).filter(Prediction.predicted_by == current_user.id).order_by(Prediction.created_at.desc()).all()
    return history

@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific prediction record
    """
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.predicted_by == current_user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    db.delete(prediction)
    db.commit()
    return {"message": "Prediction deleted successfully"}

@router.get("/analytics-top-influencers")
def get_analytics_top_influencers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get top influencers from the latest dataset uploaded by the current user
    """
    try:
        # 1. Get the latest dataset uploaded by this specific user
        dataset = db.query(Dataset).filter(Dataset.uploaded_by == current_user.id).order_by(Dataset.id.desc()).first()
        
        if not dataset or not os.path.exists(dataset.file_path):
            return {"message": "Empty", "influencers": [], "platform": "Social", "total_analyzed": 0}
        
        # 2. Determine platform from filename
        filename = dataset.filename.lower()
        platform = "Social"
        if "youtube" in filename: platform = "YouTube"
        elif "facebook" in filename: platform = "Facebook"
        elif "instagram" in filename: platform = "Instagram"
        
        df = pd.read_csv(dataset.file_path)
        
        # Map columns - use a set to track which targets we've already mapped
        # to prevent duplicate column names like multiple 'followers'
        col_mapping = {}
        mapped_targets = set()
        
        for col in df.columns:
            target = None
            if 'channel' in col or 'title' in col or 'account' in col or 'id' in col or 'user' in col:
                target = 'account_id'
            elif 'follower' in col or 'sub' in col or 'friend' in col:
                target = 'followers'
            elif 'like' in col or 'view' in col or 'received' in col:
                target = 'likes'
            elif 'share' in col or 'retweet' in col:
                target = 'shares'
            elif 'comment' in col:
                target = 'comments'
            elif 'performance' in col or 'influence' in col:
                target = 'performance_level'
            
            if target and target not in mapped_targets:
                col_mapping[col] = target
                mapped_targets.add(target)
        
        df = df.rename(columns=col_mapping)
        
        # Keep accounts and mapped columns
        keep_cols = [c for c in df.columns if c in mapped_targets]
        df = df[keep_cols]
        
        # Ensure numeric
        numeric_cols = ['followers', 'likes', 'shares', 'comments']
        for col in numeric_cols:
            if col not in df.columns:
                df[col] = 0
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Fallback for account_id
        if 'account_id' not in df.columns:
            df['account_id'] = [f"User_{i}" for i in range(len(df))]
        
        # Calculate engagement
        df['total_engagement'] = df['likes'] + df['shares'] + df['comments']
        df['engagement_rate'] = (df['total_engagement'] / (df['followers'] + 1)) * 100
        
        # Determine virality (top 10%)
        viral_threshold = df['total_engagement'].quantile(0.9) if len(df) > 0 else 0
        df['is_viral'] = df['total_engagement'] >= viral_threshold
        
        # Get top influencers
        top_df = df.nlargest(10, 'total_engagement')
        
        influencers = []
        for idx, row in top_df.iterrows():
            influencers.append({
                "account_id": str(row['account_id']),
                "followers": int(row['followers']),
                "likes": int(row['likes']),
                "shares": int(row['shares']),
                "comments": int(row['comments']),
                "total_engagement": int(row['total_engagement']),
                "engagement_rate": round(float(row['engagement_rate']), 2),
                "is_viral": bool(row['is_viral']),
                "performance_level": str(row.get('performance_level', 'Standard')).capitalize()
            })
        
        return {
            "total_analyzed": len(df),
            "viral_threshold": int(viral_threshold),
            "influencers": influencers,
            "platform": platform
        }
        
    except Exception as e:
        import traceback
        error_detail = f"Error analyzing influencers: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Log to console
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing influencers: {str(e)}"
        )
@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Get latest trained model metrics (global for now, but only if user has data)
    best_metric = db.query(ModelMetric).filter(ModelMetric.is_best == True).first()
    
    # 2. Get stats from the latest dataset UPLOADED BY THIS USER
    latest_dataset = db.query(Dataset).filter(Dataset.uploaded_by == current_user.id).order_by(Dataset.id.desc()).first()
    
    # If this user has never uploaded anything, show absolute zero/empty
    if not latest_dataset:
        return {
            "total_likes": 0,
            "total_shares": 0,
            "total_comments": 0,
            "total_records": 0,
            "system_accuracy": 0,
            "platform": "Social",
            "engagement_trend": []
        }

    accuracy = best_metric.accuracy * 100 if best_metric else 0
    total_likes = 0
    total_shares = 0
    total_comments = 0
    total_records = 0
    engagement_trend = []

    try:
        if os.path.exists(latest_dataset.file_path):
            df = pd.read_csv(latest_dataset.file_path)
            # Use fuzzy mapping logic
            df.columns = [c.lower().strip() for c in df.columns]
            
            # Identify columns
            like_col = next((c for c in df.columns if 'like' in c or 'view' in c), None)
            share_col = next((c for c in df.columns if 'share' in c or 'retweet' in c), None)
            comment_col = next((c for c in df.columns if 'comment' in c), None)
            
            if like_col: total_likes = int(pd.to_numeric(df[like_col], errors='coerce').sum())
            if share_col: total_shares = int(pd.to_numeric(df[share_col], errors='coerce').sum())
            if comment_col: total_comments = int(pd.to_numeric(df[comment_col], errors='coerce').sum())
            total_records = len(df)

            # Generate sample trend data based on the dataset
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            for i, month in enumerate(months):
                factor = (i + 1) / len(months)
                engagement_trend.append({
                    "month": month,
                    "likes": int(total_likes * 0.05 * factor + (total_likes * 0.03)),
                    "shares": int(total_shares * 0.05 * factor + (total_shares * 0.03)),
                    "comments": int(total_comments * 0.05 * factor + (total_comments * 0.03))
                })
    except Exception as e:
        print(f"Error calculating stats: {e}")

    return {
        "total_likes": total_likes,
        "total_shares": total_shares,
        "total_comments": total_comments,
        "total_records": total_records,
        "system_accuracy": round(accuracy, 2) if best_metric else 0,
        "platform": (latest_dataset.filename.lower() if latest_dataset else "Social"),
        "engagement_trend": engagement_trend
    }
