import re
from typing import Any, Dict
from app.models.domain import QueryComplexity

class QueryAnalyzer:
    ACTION_PATTERNS = [
        (r'\b(apply for|request|take)\s+(casual\s+|annual\s+|sick\s+|paid\s+)?leave\b', "leave_request"),
        (r'\b(create|open|log)\s+(a\s+)?(jira|ticket|issue)\b', "jira_ticket"),
        (r'\b(email|send|notify)\s+(this|summary|team|manager)\b', "email_notification"),
    ]

    COMPARISON_KEYWORDS = ["compare", "difference", "discrepancy", "versus", "vs", "changed since", "inconsistent", "conflict"]
    GRAPH_KEYWORDS = ["reports to", "who is", "governed by", "entitled to", "hierarchy", "relationship", "connects"]
    RESEARCH_KEYWORDS = ["analyze", "evaluate", "comprehensive review", "audit", "investigate", "inconsistencies"]

    def analyze(self, query: str, force_research: bool = False) -> Dict[str, Any]:
        lower_q = query.lower().strip()

        is_question = bool(re.match(r'^(can|could|is|are|what|how|why|does|do|should)\b', lower_q))
        detected_action = None
        if not is_question:
            for pattern, action_type in self.ACTION_PATTERNS:
                if re.search(pattern, lower_q):
                    detected_action = action_type
                    break

        if detected_action:
            complexity = QueryComplexity.ACTION_TRIGGER.value
        elif force_research or any(k in lower_q for k in self.RESEARCH_KEYWORDS):
            complexity = QueryComplexity.RESEARCH_DEEP.value
        elif any(k in lower_q for k in self.COMPARISON_KEYWORDS):
            complexity = QueryComplexity.POLICY_COMPARISON.value
        elif any(k in lower_q for k in self.GRAPH_KEYWORDS):
            complexity = QueryComplexity.RELATIONSHIP_GRAPH.value
        elif len(lower_q.split()) > 12:
            complexity = QueryComplexity.MULTI_DOC_REASONING.value
        else:
            complexity = QueryComplexity.SIMPLE_FACTUAL.value

        search_terms = [w for w in re.findall(r'\b\w+\b', lower_q) if len(w) > 3]

        return {
            "query": query,
            "complexity": complexity,
            "detected_action": detected_action,
            "search_terms": search_terms,
            "is_research_mode": complexity in [QueryComplexity.RESEARCH_DEEP.value, QueryComplexity.POLICY_COMPARISON.value]
        }

query_analyzer = QueryAnalyzer()
