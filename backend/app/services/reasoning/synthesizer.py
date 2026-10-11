import time
from typing import Dict, Any, List
from app.models.schemas import QueryRequest, QueryResponse
from app.models.domain import Citation, ConflictReport, PlanStep, ActionRequest, KnowledgeGapRecord
from app.services.retrieval.query_analyzer import query_analyzer
from app.services.retrieval.hybrid_retriever import hybrid_retriever
from app.services.reasoning.query_planner import query_planner
from app.services.reasoning.conflict_detector import conflict_detector
from app.services.reasoning.gap_detector import gap_detector
from app.services.agents.action_executor import action_executor
from app.services.llm.provider import llm_provider
from app.services.storage.metadata_db import db

class KnowledgeSynthesizer:
    def process_query(self, request: QueryRequest) -> QueryResponse:
        start_time = time.time()

        # 1. Analyze Query Intent & Complexity
        analysis = query_analyzer.analyze(request.query, force_research=request.research_mode)
        complexity = analysis["complexity"]
        is_research = request.research_mode or analysis["is_research_mode"]

        # 2. Retrieve Evidence (Hybrid + Freshness + Authority + RBAC)
        retrieval_start = time.time()
        citations: List[Citation] = hybrid_retriever.retrieve(
            query=request.query,
            space_id=request.space_id,
            strategy=request.strategy,
            user_role=request.user_role,
            top_k=8 if is_research else 4
        )
        retrieval_latency = round((time.time() - retrieval_start) * 1000, 2)

        # 3. Check for Knowledge Gap
        gap_record: Optional[KnowledgeGapRecord] = gap_detector.check_gap(
            query=request.query,
            citations=citations,
            space_id=request.space_id
        )

        # 4. Check for Cross-Document Policy Conflicts
        conflict_rep: Optional[ConflictReport] = conflict_detector.check_conflicts(
            query=request.query,
            citations=citations
        )

        # 5. Generate Multi-Step Research Plan if in research or complex mode
        plan_steps: Optional[List[PlanStep]] = None
        if is_research:
            plan_steps = query_planner.generate_plan(request.query, complexity)

        # 6. Check for Action Triggers (Leave, Jira, Email)
        proposed_action: Optional[ActionRequest] = None
        if analysis.get("detected_action"):
            proposed_action = action_executor.propose_action(
                action_type=analysis["detected_action"],
                query=request.query,
                user_id=request.user_id
            )

        # 7. Synthesize Response using LLM
        answer = llm_provider.generate_chat_response(
            query=request.query,
            citations=citations,
            conflict=conflict_rep,
            history=[m.model_dump() for m in request.conversation_history],
            research_mode=is_research
        )

        # Calculate Confidence Score based on top citation composite score
        confidence = citations[0].composite_score if citations else 0.15
        if conflict_rep and conflict_rep.has_conflict:
            confidence = max(confidence, conflict_rep.confidence)

        total_latency = round((time.time() - start_time) * 1000, 2)

        # Log to Audit DB
        db.log_query(
            query=request.query,
            space_id=request.space_id,
            strategy=request.strategy,
            confidence=confidence,
            latency_ms=total_latency,
            had_conflict=conflict_rep is not None and conflict_rep.has_conflict,
            had_gap=gap_record is not None
        )

        return QueryResponse(
            query=request.query,
            answer=answer,
            confidence_score=round(confidence, 2),
            citations=citations,
            conflict_report=conflict_rep,
            plan_steps=plan_steps,
            proposed_action=proposed_action,
            knowledge_gap=gap_record,
            complexity_category=complexity,
            strategy_used=request.strategy,
            retrieval_latency_ms=retrieval_latency,
            total_latency_ms=total_latency,
            active_space=request.space_id
        )

synthesizer = KnowledgeSynthesizer()
