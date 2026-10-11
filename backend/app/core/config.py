import os
from typing import Dict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Generative AI Knowledge Assistant"
    API_V1_STR: str = "/api/v1"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(os.path.dirname(BASE_DIR), "data")
    DB_PATH: str = os.path.join(DATA_DIR, "knowledge.db")
    UPLOAD_DIR: str = os.path.join(DATA_DIR, "uploads")
    
    LLM_PROVIDER: str = "auto"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    
    WEIGHT_SEMANTIC: float = 0.40
    WEIGHT_BM25: float = 0.25
    WEIGHT_AUTHORITY: float = 0.20
    WEIGHT_FRESHNESS: float = 0.15
    
    AUTHORITY_WEIGHTS: Dict[str, float] = {
        "official_policy": 1.0,
        "standard": 0.85,
        "sop": 0.75,
        "guideline": 0.60,
        "faq": 0.50,
        "memo": 0.35,
        "draft": 0.20
    }
    
    FRESHNESS_LAMBDA: float = 0.0015
    CONFLICT_CONTRADICTION_THRESHOLD: float = 0.65
    KNOWLEDGE_GAP_THRESHOLD: float = 0.45

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
