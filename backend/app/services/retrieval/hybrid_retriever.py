from typing import List, Dict, Optional
from app.models.domain import Chunk, Citation
from app.services.storage.metadata_db import db
from app.services.storage.vector_store import vector_store
from app.services.storage.bm25_store import bm25_store
from app.services.storage.graph_store import graph_store
from app.services.retrieval.evidence_ranker import evidence_ranker

class HybridRetriever:
    def retrieve(
        self,
        query: str,
        space_id: Optional[str] = "company-wide",
        strategy: str = "adaptive",
        user_role: str = "employee",
        top_k: int = 5
    ) -> List[Citation]:
        # 1. Fetch chunks available in database (filtered by space_id)
        all_chunks = db.get_all_chunks(space_id=space_id)
        if not all_chunks:
            return []

        chunk_map = {c.id: c for c in all_chunks}

        # 2. Dense Semantic Search
        vec_results = vector_store.search(query, top_k=20)
        vec_scores: Dict[str, float] = {c_id: score for c_id, score in vec_results}

        # 3. Sparse BM25 Keyword Search
        bm25_results = bm25_store.search(query, top_k=20)
        bm25_scores: Dict[str, float] = {c_id: score for c_id, score in bm25_results}

        # 4. Graph-augmented entity expansion
        graph_boosted_ids = set()
        if strategy == "adaptive":
            words = query.split()
            expanded_entities = graph_store.get_related_entities(words, hops=1)
            for c_id, chunk in chunk_map.items():
                if any(e.lower() in chunk.content.lower() for e in expanded_entities):
                    graph_boosted_ids.add(c_id)

        # 5. Union of candidate IDs
        candidate_ids = set(vec_scores.keys()) | set(bm25_scores.keys()) | graph_boosted_ids

        # If candidates are sparse, fallback to all available chunks in this space
        if len(candidate_ids) == 0:
            candidate_ids = set(chunk_map.keys())

        ranked_citations: List[Citation] = []
        for c_id in candidate_ids:
            chunk = chunk_map.get(c_id)
            if not chunk:
                continue

            # Role-Based Visibility Check
            doc = db.get_document(chunk.document_id)
            if doc and doc.visibility == "confidential" and user_role not in ["executive", "admin", "hr_manager"]:
                continue

            s_sem = vec_scores.get(c_id, 0.1)
            s_bm = bm25_scores.get(c_id, 0.0)

            # If graph boosted, slightly boost semantic score
            if c_id in graph_boosted_ids and strategy == "adaptive":
                s_sem = min(1.0, s_sem + 0.15)

            citation = evidence_ranker.rank_chunk(chunk, s_sem, s_bm, strategy=strategy)
            ranked_citations.append(citation)

        # Sort by composite_score descending
        ranked_citations.sort(key=lambda x: x.composite_score, reverse=True)
        return ranked_citations[:top_k]

hybrid_retriever = HybridRetriever()
