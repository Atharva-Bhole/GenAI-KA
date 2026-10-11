from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.models.domain import (
    ActionRequest, Citation, ConflictReport, GraphEdge, GraphNode,
    KnowledgeGapRecord, PlanStep
)

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    space_id: str = "company-wide"
    research_mode: bool = False
    strategy: str = "adaptive"
    user_role: str = "employee"
    user_id: str = "atharva"
    conversation_history: List[ChatMessage] = []

class QueryResponse(BaseModel):
    query: str
    answer: str
    confidence_score: float
    citations: List[Citation]
    conflict_report: Optional[ConflictReport] = None
    plan_steps: Optional[List[PlanStep]] = None
    proposed_action: Optional[ActionRequest] = None
    knowledge_gap: Optional[KnowledgeGapRecord] = None
    complexity_category: str
    strategy_used: str
    retrieval_latency_ms: float
    total_latency_ms: float
    active_space: str

class DocumentCreateRequest(BaseModel):
    title: str
    department: str
    effective_date: str
    version: str
    authority: str
    owner: str
    visibility: str = "internal"
    space_id: str = "company-wide"
    raw_text: Optional[str] = None

class DocumentUpdateRequest(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    effective_date: Optional[str] = None
    version: Optional[str] = None
    authority: Optional[str] = None
    owner: Optional[str] = None
    visibility: Optional[str] = None
    space_id: Optional[str] = None

class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ActionExecuteRequest(BaseModel):
    action_type: str
    parameters: Dict[str, Any]
    user_id: str = "atharva"

class ActionExecuteResponse(BaseModel):
    success: bool
    action_type: str
    message: str
    details: Dict[str, Any]

class BenchmarkMetric(BaseModel):
    strategy: str
    accuracy_score: float
    faithfulness_score: float
    context_precision: float
    citation_accuracy: float
    hallucination_rate: float
    avg_latency_ms: float
    test_queries_count: int

class BenchmarkRunResponse(BaseModel):
    timestamp: str
    evaluations: List[BenchmarkMetric]
    sample_comparisons: List[Dict[str, Any]]
