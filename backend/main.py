from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models.models import Base
from app.api import auth, ml_routes
from app.core.config import settings

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ml_routes.router, prefix="/api/ml", tags=["Machine Learning"])

@app.get("/")
def root():
    return {"message": "Welcome to Social Network Influence Prediction System API"}
