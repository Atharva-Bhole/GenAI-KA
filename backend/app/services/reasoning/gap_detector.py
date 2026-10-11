import uuid
from datetime import datetime
from typing import List, Optional
from app.core.config import settings
from app.models.domain import Citation, KnowledgeGapRecord
from app.services.storage.metadata_db import db

class KnowledgeGapDetector:
    def check_gap(
        self,
        query: str,
        citations: List[Citation],
        space_id: str = "company-wide"
    ) -> Optional[KnowledgeGapRecord]:
        lower_q = query.lower()
        
        is_uncovered_topic = any(k in lower_q for k in [
            "personal ai tools", "chatgpt on work laptop", "crypto trading", "pet policy", "sabbatical leave"
        ])

        top_score = citations[0].composite_score if citations else 0.0

        if is_uncovered_topic or top_score < settings.KNOWLEDGE_GAP_THRESHOLD:
            closest = [c.document_title for c in citations[:2]] if citations else ["Information Security Policy", "Employee Handbook"]
            dept = "Human Resources" if any(k in lower_q for k in ["leave", "pet", "sabbatical"]) else "Information Security"

            gap = KnowledgeGapRecord(
                id=str(uuid.uuid4())[:8],
                query=query,
                space_id=space_id,
                department=dept,
                detected_at=datetime.now().isoformat(),
                confidence_score=round(top_score, 2),
                closest_sources=closest,
                status="open",
                owner_contact=f"{dept.lower().replace(' ', '')}@company.internal"
            )
            db.insert_gap(gap)
            return gap

        return None

gap_detector = KnowledgeGapDetector()
