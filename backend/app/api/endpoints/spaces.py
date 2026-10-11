import uuid
from typing import List
from fastapi import APIRouter
from app.models.domain import KnowledgeSpace
from app.services.storage.metadata_db import db

router = APIRouter()

@router.get("", response_model=List[KnowledgeSpace])
def get_spaces():
    return db.list_spaces()

@router.post("", response_model=KnowledgeSpace)
def create_space(space: KnowledgeSpace):
    if not space.id:
        space.id = f"space-{uuid.uuid4().hex[:6]}"
    db.insert_space(space)
    return space

