import os
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.models.schemas import GeminiConfigRequest, GeminiConfigResponse
from app.services.llm.provider import llm_provider
from app.services.storage.metadata_db import db
from app.services.storage.vector_store import vector_store
from app.api.endpoints.documents import _reindex_all

router = APIRouter()

def _write_env_key(key: str, model: str):
    env_path = os.path.join(os.path.dirname(settings.BASE_DIR), ".env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    
    updated_key = False
    updated_model = False
    new_lines = []
    for line in lines:
        if line.startswith("GEMINI_API_KEY="):
            new_lines.append(f"GEMINI_API_KEY={key}\n")
            updated_key = True
        elif line.startswith("DEFAULT_MODEL="):
            new_lines.append(f"DEFAULT_MODEL={model}\n")
            updated_model = True
        else:
            new_lines.append(line)
            
    if not updated_key:
        new_lines.append(f"GEMINI_API_KEY={key}\n")
    if not updated_model:
        new_lines.append(f"DEFAULT_MODEL={model}\n")
        
    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

@router.get("/gemini", response_model=GeminiConfigResponse)
def get_gemini_status():
    chunks = db.get_all_chunks()
    has_key = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)
    return GeminiConfigResponse(
        configured=has_key,
        active_provider="gemini" if (has_key and llm_provider.gemini_client) else "local",
        model=settings.DEFAULT_MODEL,
        embedding_model="text-embedding-004",
        has_api_key=has_key,
        total_indexed_chunks=len(chunks),
        gemini_vectors_active=vector_store.gemini_vectors_active
    )

@router.post("/gemini", response_model=GeminiConfigResponse)
def configure_gemini(req: GeminiConfigRequest):
    cleaned_key = req.api_key.strip()
    if not cleaned_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    target_model = req.model or settings.DEFAULT_MODEL
    valid, message = llm_provider.test_connection(cleaned_key, target_model)
    if not valid:
        raise HTTPException(
            status_code=400,
            detail=f"Gemini API verification failed: {message}"
        )

    _write_env_key(cleaned_key, target_model)
    llm_provider.reinitialize(cleaned_key, target_model)
    
    try:
        _reindex_all()
    except Exception as e:
        print(f"Re-indexing failed: {e}")

    chunks = db.get_all_chunks()
    return GeminiConfigResponse(
        configured=True,
        active_provider="gemini",
        model=settings.DEFAULT_MODEL,
        embedding_model="text-embedding-004",
        has_api_key=True,
        total_indexed_chunks=len(chunks),
        gemini_vectors_active=vector_store.gemini_vectors_active
    )

@router.post("/gemini/disconnect", response_model=GeminiConfigResponse)
def disconnect_gemini():
    settings.GEMINI_API_KEY = ""
    _write_env_key("", settings.DEFAULT_MODEL)
    llm_provider.reinitialize("", settings.DEFAULT_MODEL)
    _reindex_all()
    
    chunks = db.get_all_chunks()
    return GeminiConfigResponse(
        configured=False,
        active_provider="local",
        model=settings.DEFAULT_MODEL,
        embedding_model="text-embedding-004",
        has_api_key=False,
        total_indexed_chunks=len(chunks),
        gemini_vectors_active=False
    )
