from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models.models import Base
from app.api import auth, ml_routes
from app.core.config import settings

import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Database
Base.metadata.create_all(bind=engine)
logger.info("Database initialized")

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ml_routes.router, prefix="/api/ml", tags=["Machine Learning"])

@app.get("/")
def root():
    return {"message": "INFLUENCE-API-ALIVE", "version": "1.1.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "influence-api"}
