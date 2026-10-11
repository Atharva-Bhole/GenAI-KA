from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse
from app.services.reasoning.synthesizer import synthesizer

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
def query_knowledge_base(request: QueryRequest):
    try:
        return synthesizer.process_query(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
