from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Social Network Influence Prediction System"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_12345" # In production, use env variable
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    DATABASE_URL: str = "sqlite:///./sql_app.db"

settings = Settings()
