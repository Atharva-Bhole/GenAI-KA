import time
from typing import List, Optional
from app.models.domain import ActionRequest, Citation, ConflictReport, KnowledgeGapRecord, PlanStep
from app.models.schemas import QueryRequest, QueryResponse
from app.services.agents.action_executor import action_executor
from app.services.llm.provider import llm_provider
from app.services.reasoning.conflict_detector import conflict_detector
from app.services.reasoning.gap_detector import gap_detector
from app.services.reasoning.query_planner import query_planner
from app.services.retrieval.hybrid_retriever import hybrid_retriever
from app.services.retrieval.query_analyzer import query_analyzer
from app.services.storage.metadata_db import db

class KnowledgeSynthesizer:
    def process_query(self, request: QueryRequest) -> QueryResponse:
        start_time = time.time()

        analysis = query_analyzer.analyze(request.query, force_research=request.research_mode)
        complexity = analysis["complexity"]
        is_research = request.research_mode or analysis["is_research_mode"]

        retrieval_start = time.time()
        citations: List[Citation] = hybrid_retriever.retrieve(
            query=request.query,
            space_id=request.space_id,
            strategy=request.strategy,
            user_role=request.user_role,
            top_k=8 if is_research else 4
        )
        retrieval_latency = round((time.time() - retrieval_start) * 1000, 2)

        gap_record: Optional[KnowledgeGapRecord] = gap_detector.check_gap(
            query=request.query,
            citations=citations,
            space_id=request.space_id
        )

        conflict_rep: Optional[ConflictReport] = conflict_detector.check_conflicts(
            query=request.query,
            citations=citations
        )

        plan_steps: Optional[List[PlanStep]] = None
        if is_research:
            plan_steps = query_planner.generate_plan(request.query, complexity)

        proposed_action: Optional[ActionRequest] = None
        if analysis.get("detected_action"):
            proposed_action = action_executor.propose_action(
                action_type=analysis["detected_action"],
                query=request.query,
                user_id=request.user_id
            )

        answer = llm_provider.generate_chat_response(
            query=request.query,
            citations=citations,
            conflict=conflict_rep,
            history=[m.model_dump() for m in request.conversation_history],
            research_mode=is_research
        )

        confidence = citations[0].composite_score if citations else 0.15
        if conflict_rep and conflict_rep.has_conflict:
            confidence = max(confidence, conflict_rep.confidence)

        total_latency = round((time.time() - start_time) * 1000, 2)

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
