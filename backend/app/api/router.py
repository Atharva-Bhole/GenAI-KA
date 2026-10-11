from fastapi import APIRouter
from app.api.endpoints import actions, benchmark, chat, config, documents, governance, graph, spaces

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["Chat & Intelligence"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Ingestion"])
api_router.include_router(spaces.router, prefix="/spaces", tags=["Knowledge Spaces"])
api_router.include_router(graph.router, prefix="/graph", tags=["Knowledge Graph"])
api_router.include_router(actions.router, prefix="/actions", tags=["Agent Workflows"])
api_router.include_router(governance.router, prefix="/governance", tags=["Knowledge Governance"])
api_router.include_router(benchmark.router, prefix="/benchmark", tags=["Empirical Benchmark"])
api_router.include_router(config.router, prefix="/config", tags=["Configuration & Engine"])

