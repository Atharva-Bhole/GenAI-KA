from typing import Dict, List, Optional
from app.core.config import settings
from app.models.domain import Citation, ConflictReport

class LLMProvider:
    def __init__(self):
        self.gemini_client = None
        self.openai_client = None
        self._init_clients()

    def _init_clients(self):
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                pass

        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception:
                pass

    def generate_chat_response(
        self,
        query: str,
        citations: List[Citation],
        conflict: Optional[ConflictReport] = None,
        history: Optional[List[Dict[str, str]]] = None,
        research_mode: bool = False
    ) -> str:
        evidence_text = ""
        for i, c in enumerate(citations[:5], 1):
            evidence_text += (
                f"\n[Source {i}]: {c.document_title} (Ver: {c.version}, Date: {c.effective_date}, Auth: {c.authority})\n"
                f"Location: Page {c.page_number}, Section: {c.section_title}\n"
                f"Content: \"{c.exact_text}\"\n"
            )

        conflict_text = ""
        if conflict and conflict.has_conflict:
            conflict_text = (
                f"\n[GOVERNANCE ADVISORY - CONFLICT DETECTED]\n"
                f"Discrepancy: {conflict.discrepancy_details}\n"
                f"Source A ({conflict.source_a} v{conflict.version_a}): {conflict.claim_a}\n"
                f"Source B ({conflict.source_b} v{conflict.version_b}): {conflict.claim_b}\n"
                f"Authoritative Source: {conflict.authoritative_source}\n"
                f"Recommended Governed Resolution: {conflict.recommended_answer}\n"
            )

        system_prompt = (
            "You are the Enterprise Generative AI Knowledge Assistant — an authoritative, evidence-grounded intelligence layer.\n"
            "Guidelines:\n"
            "1. Answer strictly based on the provided enterprise evidence sources.\n"
            "2. Always cite specific documents, pages, and sections where facts originate.\n"
            "3. If a conflict is noted, explicitly address the discrepancy, highlight which document is superseding/authoritative, and recommend the governed answer.\n"
            "4. If evidence is completely missing, explicitly state what is missing rather than hallucinating.\n"
            "5. Maintain a professional, executive enterprise tone.\n"
        )

        user_prompt = (
            f"Employee Question: \"{query}\"\n\n"
            f"Retrieved Evidence:\n{evidence_text}\n"
            f"{conflict_text}\n"
            "Provide a comprehensive, clear, and grounded answer with precise citations."
        )

        if self.gemini_client:
            try:
                resp = self.gemini_client.models.generate_content(
                    model=settings.DEFAULT_MODEL,
                    contents=f"{system_prompt}\n\n{user_prompt}"
                )
                if resp.text:
                    return resp.text.strip()
            except Exception:
                pass

        if self.openai_client:
            try:
                resp = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2
                )
                ans = resp.choices[0].message.content
                if ans:
                    return ans.strip()
            except Exception:
                pass

        return self._local_synthesize(query, citations, conflict, research_mode)

    def _local_synthesize(
        self,
        query: str,
        citations: List[Citation],
        conflict: Optional[ConflictReport],
        research_mode: bool
    ) -> str:
        if not citations:
            return (
                f"I could not locate verified organizational documentation directly addressing your query: \"{query}\".\n\n"
                "A Knowledge Gap has been recorded and flagged for the appropriate department lead to author or update official documentation."
            )

        top = citations[0]
        lines = []

        if conflict and conflict.has_conflict:
            lines.append("### Policy Conflict & Governance Advisory")
            lines.append("A discrepancy was identified between active organizational records regarding this query.")
            lines.append(f"- **{conflict.source_b} (v{conflict.version_b})**: {conflict.claim_b}")
            lines.append(f"- **{conflict.source_a} (v{conflict.version_a})**: {conflict.claim_a}")
            lines.append(f"\n**Resolution**: According to enterprise policy hierarchy, **{conflict.authoritative_source}** is classified as the authoritative document ({conflict.recommended_answer}).\n")

        lines.append("### Answer Summary")
        if research_mode:
            lines.append(f"Comprehensive cross-document analysis across **{len(citations)}** organizational sources:")
            for i, c in enumerate(citations[:3], 1):
                clean_snippet = c.exact_text.replace('\n', ' ')
                lines.append(f"**{i}. From {c.document_title} (Page {c.page_number}, {c.section_title}):**")
                lines.append(f"> \"{clean_snippet}\"\n")
        else:
            clean_snippet = top.exact_text.replace('\n', ' ')
            lines.append(f"Based on the **{top.document_title}** ({top.section_title}, Page {top.page_number}):")
            lines.append(f"> \"{clean_snippet}\"\n")
            if len(citations) > 1:
                sub = citations[1]
                lines.append(f"This is corroborated by **{sub.document_title}** (Page {sub.page_number}):")
                lines.append(f"> \"{sub.exact_text[:200]}...\"\n")

        lines.append(f"*(Confidence: {int(top.composite_score * 100)}% based on authority ranking, freshness decay, and semantic matching)*")
        return "\n".join(lines)

llm_provider = LLMProvider()
