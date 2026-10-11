from typing import List
from fastapi import APIRouter
from app.models.domain import KnowledgeGapRecord
from app.services.storage.metadata_db import db

router = APIRouter()

@router.get("/gaps", response_model=List[KnowledgeGapRecord])
def list_knowledge_gaps():
    return db.list_gaps()

@router.post("/gaps/{gap_id}/resolve")
def resolve_knowledge_gap(gap_id: str):
    db.resolve_gap(gap_id)
    return {"success": True, "message": f"Knowledge gap {gap_id} marked as resolved"}

@router.get("/analytics")
def get_governance_analytics():
    return db.get_query_stats()
