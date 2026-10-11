from fastapi import APIRouter
from app.models.schemas import KnowledgeGraphResponse
from app.services.storage.graph_store import graph_store

router = APIRouter()

@router.get("", response_model=KnowledgeGraphResponse)
def get_knowledge_graph():
    return graph_store.export_graph_data()
