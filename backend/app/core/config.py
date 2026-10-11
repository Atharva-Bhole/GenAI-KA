import os
from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Generative AI Knowledge Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(os.path.dirname(BASE_DIR), "data")
    DB_PATH: str = os.path.join(DATA_DIR, "knowledge.db")
    UPLOAD_DIR: str = os.path.join(DATA_DIR, "uploads")
    
    # LLM & Embedding Settings
    LLM_PROVIDER: str = "auto"  # "gemini", "openai", "local_semantic"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    
    # Evidence Ranking Weights
    WEIGHT_SEMANTIC: float = 0.40
    WEIGHT_BM25: float = 0.25
    WEIGHT_AUTHORITY: float = 0.20
    WEIGHT_FRESHNESS: float = 0.15
    
    # Authority Score Scale (0.0 to 1.0)
    AUTHORITY_WEIGHTS: Dict[str, float] = {
        "official_policy": 1.0,
        "standard": 0.85,
        "sop": 0.75,
        "guideline": 0.60,
        "faq": 0.50,
        "memo": 0.35,
        "draft": 0.20
    }
    
    # Freshness Decay factor (lambda per day: higher = faster decay)
    FRESHNESS_LAMBDA: float = 0.0015  # ~50% retention after ~460 days
    
    # Thresholds
    CONFLICT_CONTRADICTION_THRESHOLD: float = 0.65
    KNOWLEDGE_GAP_THRESHOLD: float = 0.45  # If best chunk final_score < 0.45, flag gap

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
