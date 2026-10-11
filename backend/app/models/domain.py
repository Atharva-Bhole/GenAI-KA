from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class AuthorityType(str, Enum):
    OFFICIAL_POLICY = "official_policy"
    STANDARD = "standard"
    SOP = "sop"
    GUIDELINE = "guideline"
    FAQ = "faq"
    MEMO = "memo"
    DRAFT = "draft"

class VisibilityType(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

class QueryComplexity(str, Enum):
    SIMPLE_FACTUAL = "simple_factual"
    MULTI_DOC_REASONING = "multi_doc_reasoning"
    POLICY_COMPARISON = "policy_comparison"
    RELATIONSHIP_GRAPH = "relationship_graph"
    ACTION_TRIGGER = "action_trigger"
    RESEARCH_DEEP = "research_deep"

class Document(BaseModel):
    id: str
    filename: str
    title: str
    department: str
    effective_date: str  # YYYY-MM-DD
    version: str
    authority: str = AuthorityType.OFFICIAL_POLICY.value
    owner: str
    visibility: str = VisibilityType.INTERNAL.value
    space_id: str = "company-wide"
    file_type: str = "pdf"
    file_path: Optional[str] = None
    chunk_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    last_updated: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

class Chunk(BaseModel):
    id: str
    document_id: str
    document_title: str
    department: str
    page_number: int = 1
    section_title: str = "General"
    content: str
    effective_date: str = ""
    version: str = "1.0"
    authority: str = "official_policy"
    entities: List[str] = []
    vector_id: Optional[str] = None

class KnowledgeSpace(BaseModel):
    id: str
    name: str
    description: str
    department: str
    icon: str = "folder"
    document_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "Policy", "Concept", "Department", "Rule", "Role", "Tool"
    department: Optional[str] = None
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str  # "governed_by", "entitled_to", "reimbursed_under", "supersedes", "applies_to"
    weight: float = 1.0

class Citation(BaseModel):
    document_id: str
    document_title: str
    department: str
    page_number: int
    section_title: str
    exact_text: str
    effective_date: str
    version: str
    authority: str
    semantic_score: float
    bm25_score: float
    authority_score: float
    freshness_score: float
    composite_score: float

class ConflictReport(BaseModel):
    has_conflict: bool
    title: str = ""
    discrepancy_details: str = ""
    source_a: str = ""
    version_a: str = ""
    claim_a: str = ""
    source_b: str = ""
    version_b: str = ""
    claim_b: str = ""
    authoritative_source: str = ""
    recommended_answer: str = ""
    confidence: float = 0.0

class PlanStep(BaseModel):
    step_id: int
    title: str
    description: str
    targeted_sources: List[str] = []
    status: str = "pending"  # "pending", "in_progress", "completed"
    findings: str = ""

class ActionRequest(BaseModel):
    action_type: str  # "leave_request", "jira_ticket", "email_notification"
    title: str
    parameters: Dict[str, Any]
    requires_confirmation: bool = True
    status: str = "proposed"  # "proposed", "executed", "cancelled"
    execution_result: Optional[Dict[str, Any]] = None

class KnowledgeGapRecord(BaseModel):
    id: str
    query: str
    space_id: str
    department: str
    detected_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    confidence_score: float
    closest_sources: List[str] = []
    status: str = "open"  # "open", "assigned", "resolved"
    owner_contact: str = "admin@company.internal"
