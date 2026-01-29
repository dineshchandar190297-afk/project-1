from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models.models import Base
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.ml_routes import router as ml_router
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Database
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug: Log all routes on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Listing all active routes:")
    for route in app.routes:
        logger.info(f"Route: {route.path} | Methods: {getattr(route, 'methods', 'N/A')}")

# Include Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ml_router, prefix="/api/ml", tags=["Machine Learning"])

@app.get("/")
def root():
    return {"message": "INFLUENCE-API-ALIVE", "version": "1.1.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "influence-api"}
