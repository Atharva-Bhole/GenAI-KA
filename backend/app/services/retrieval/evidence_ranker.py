import math
from datetime import datetime
from typing import Dict, Any, List
from app.core.config import settings
from app.models.domain import Chunk, Citation

class EvidenceRanker:
    def __init__(self):
        self.weights = {
            "sem": settings.WEIGHT_SEMANTIC,
            "bm25": settings.WEIGHT_BM25,
            "auth": settings.WEIGHT_AUTHORITY,
            "fresh": settings.WEIGHT_FRESHNESS
        }
        self.authority_weights = settings.AUTHORITY_WEIGHTS
        self.freshness_lambda = settings.FRESHNESS_LAMBDA

    def calculate_freshness(self, date_str: str) -> float:
        if not date_str:
            return 0.5
        try:
            doc_date = datetime.strptime(date_str, "%Y-%m-%d")
            now = datetime.now()
            # If doc is futuristic (e.g. 2026 active policy), delta is 0 or negative
            delta_days = (now - doc_date).days
            if delta_days <= 0:
                # Active latest policy!
                return 1.0
            # Exponential decay: e^(-lambda * days)
            freshness = math.exp(-self.freshness_lambda * delta_days)
            return max(0.05, min(freshness, 1.0))
        except Exception:
            return 0.5

    def calculate_authority(self, authority_str: str) -> float:
        return self.authority_weights.get(authority_str.lower(), 0.5)

    def rank_chunk(
        self,
        chunk: Chunk,
        semantic_score: float,
        bm25_score: float,
        strategy: str = "adaptive"
    ) -> Citation:
        auth_score = self.calculate_authority(chunk.authority)
        fresh_score = self.calculate_freshness(chunk.effective_date)

        if strategy == "naive_rag":
            # Only semantic vector similarity
            composite = semantic_score
        elif strategy == "hybrid_rag":
            # 50% semantic + 50% BM25
            composite = (0.5 * semantic_score) + (0.5 * bm25_score)
        else:
            # Full Adaptive Intelligence formula:
            # Score = w_sem * S_sem + w_bm25 * S_bm25 + w_auth * Auth + w_fresh * Fresh
            composite = (
                self.weights["sem"] * semantic_score +
                self.weights["bm25"] * bm25_score +
                self.weights["auth"] * auth_score +
                self.weights["fresh"] * fresh_score
            )

        return Citation(
            document_id=chunk.document_id,
            document_title=chunk.document_title,
            department=chunk.department,
            page_number=chunk.page_number,
            section_title=chunk.section_title,
            exact_text=chunk.content,
            effective_date=chunk.effective_date,
            version=chunk.version,
            authority=chunk.authority,
            semantic_score=round(semantic_score, 3),
            bm25_score=round(bm25_score, 3),
            authority_score=round(auth_score, 3),
            freshness_score=round(fresh_score, 3),
            composite_score=round(composite, 3)
        )

evidence_ranker = EvidenceRanker()
