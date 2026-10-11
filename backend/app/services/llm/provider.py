import re
from typing import AsyncGenerator, Dict, List, Optional, Tuple
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
                self.gemini_client = None
        else:
            self.gemini_client = None

        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception:
                self.openai_client = None
        else:
            self.openai_client = None

    def reinitialize(self, api_key: str, model: Optional[str] = None):
        settings.GEMINI_API_KEY = api_key
        if model:
            settings.DEFAULT_MODEL = model
        self._init_clients()

    def test_connection(self, api_key: str, model: str = "gemini-2.5-flash") -> Tuple[bool, str]:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            resp = client.models.generate_content(
                model=model,
                contents="Health check: reply with ONLINE."
            )
            if resp.text:
                return True, "Successfully connected to Google Gemini API"
            return False, "Gemini returned empty response"
        except Exception as e:
            return False, str(e)

    def _build_prompts(
        self,
        query: str,
        citations: List[Citation],
        conflict: Optional[ConflictReport] = None,
        history: Optional[List[Dict[str, str]]] = None,
        research_mode: bool = False
    ) -> Tuple[str, str]:
        evidence_text = ""
        for i, c in enumerate(citations[:6], 1):
            evidence_text += (
                f"\n[Source {i}]: {c.document_title} (Version: {c.version}, Effective: {c.effective_date}, Authority: {c.authority})\n"
                f"Location: Page {c.page_number}, Section: {c.section_title}\n"
                f"Evidence: \"{c.exact_text}\"\n"
            )

        conflict_text = ""
        if conflict and conflict.has_conflict:
            conflict_text = (
                f"\n[GOVERNANCE CONFLICT NOTICE]\n"
                f"Discrepancy: {conflict.discrepancy_details}\n"
                f"Source A ({conflict.source_a} v{conflict.version_a}): {conflict.claim_a}\n"
                f"Source B ({conflict.source_b} v{conflict.version_b}): {conflict.claim_b}\n"
                f"Authoritative Precedent: {conflict.authoritative_source}\n"
                f"Governed Resolution: {conflict.recommended_answer}\n"
            )

        history_text = ""
        if history:
            history_text = "\n[CONVERSATION HISTORY]\n"
            for h in history[-4:]:
                history_text += f"{h.get('role', 'user').capitalize()}: {h.get('content', '')}\n"

        system_prompt = (
            "You are the Enterprise Generative AI Knowledge Assistant — an authoritative, evidence-grounded intelligence layer.\n"
            "Rules:\n"
            "1. Answer strictly based on the provided enterprise evidence sources.\n"
            "2. Cite specific documents, sections, and page numbers for each factual claim.\n"
            "3. If a governance conflict is identified, clearly explain the discrepancy between older and newer policies, identify which document is authoritative, and give the governed resolution.\n"
            "4. If evidence is missing, state what is missing instead of guessing.\n"
            "5. Maintain a professional, executive enterprise tone.\n"
            "6. At the very end of your response, output exactly 3 natural follow-up questions formatted as:\n"
            "<<FOLLOWUP: Question 1 | Question 2 | Question 3>>"
        )

        user_prompt = (
            f"{history_text}\n"
            f"Employee Question: \"{query}\"\n\n"
            f"Retrieved Evidence:\n{evidence_text}\n"
            f"{conflict_text}\n"
            "Provide a comprehensive, clear, and grounded answer with citations."
        )

        return system_prompt, user_prompt

    def _extract_followups(self, text: str) -> Tuple[str, List[str]]:
        match = re.search(r'<<FOLLOWUP:\s*(.*?)>>', text, re.DOTALL)
        if match:
            raw = match.group(1).strip()
            parts = [p.strip() for p in raw.split('|') if p.strip()]
            cleaned_text = re.sub(r'<<FOLLOWUP:\s*(.*?)>>', '', text).strip()
            return cleaned_text, parts[:3]
        return text.strip(), []

    def generate_chat_response(
        self,
        query: str,
        citations: List[Citation],
        conflict: Optional[ConflictReport] = None,
        history: Optional[List[Dict[str, str]]] = None,
        research_mode: bool = False
    ) -> Tuple[str, List[str], str]:
        system_prompt, user_prompt = self._build_prompts(
            query, citations, conflict, history, research_mode
        )

        if self.gemini_client:
            try:
                combined_prompt = f"{system_prompt}\n\n{user_prompt}"
                resp = self.gemini_client.models.generate_content(
                    model=settings.DEFAULT_MODEL,
                    contents=combined_prompt
                )
                if resp.text:
                    clean_text, followups = self._extract_followups(resp.text)
                    if not followups:
                        followups = self._generate_default_followups(query, citations)
                    return clean_text, followups, "gemini"
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
                    clean_text, followups = self._extract_followups(ans)
                    if not followups:
                        followups = self._generate_default_followups(query, citations)
                    return clean_text, followups, "openai"
            except Exception:
                pass

        local_answer = self._local_synthesize(query, citations, conflict, research_mode)
        default_followups = self._generate_default_followups(query, citations)
        return local_answer, default_followups, "local"

    def _generate_default_followups(self, query: str, citations: List[Citation]) -> List[str]:
        q_lower = query.lower()
        if "leave" in q_lower or "vacation" in q_lower:
            return [
                "What is the maximum consecutive annual leave allowed?",
                "How does sick leave carryover work at year-end?",
                "Can I encash unused annual leave days upon resignation?"
            ]
        elif "travel" in q_lower or "expense" in q_lower or "flight" in q_lower:
            return [
                "What is our daily per-diem allowance for Tier 1 international cities?",
                "Are airport lounge access fees reimbursable under Travel Policy?",
                "What is the approval threshold for business class flights?"
            ]
        elif "remote" in q_lower or "wfh" in q_lower or "outside" in q_lower:
            return [
                "What equipment stipend is provided for remote employees?",
                "Can remote engineers work from another country for up to 30 days?",
                "What are the core collaboration hours for distributed teams?"
            ]
        elif "password" in q_lower or "security" in q_lower or "mfa" in q_lower:
            return [
                "What authenticator apps are approved for enterprise MFA?",
                "What is the protocol for reporting a suspected phishing attempt?",
                "Are hardware security keys (YubiKeys) supported for SSO?"
            ]
        else:
            doc_titles = list(set([c.document_title for c in citations[:2]]))
            if doc_titles:
                return [
                    f"Can you summarize key exceptions under {doc_titles[0]}?",
                    "Who is the designated compliance owner for this policy?",
                    "What are the disciplinary consequences of policy non-compliance?"
                ]
            return [
                "What other policies relate to this topic?",
                "Has this policy been updated in 2026?",
                "Who should I contact for an official policy exception?"
            ]

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

        lines.append("### Grounded Answer")
        if research_mode:
            lines.append(f"Comprehensive cross-document analysis across **{len(citations)}** organizational sources:")
            for i, c in enumerate(citations[:3], 1):
                clean_snippet = c.exact_text.replace('\n', ' ')
                lines.append(f"**{i}. From {c.document_title} (Page {c.page_number}, {c.section_title}):**")
                lines.append(f"> \"{clean_snippet}\"\n")
        else:
            clean_snippet = top.exact_text.replace('\n', ' ')
            lines.append(f"According to the **{top.document_title}** ({top.section_title}, Page {top.page_number}):")
            lines.append(f"> \"{clean_snippet}\"\n")
            if len(citations) > 1:
                sub = citations[1]
                lines.append(f"This is corroborated by **{sub.document_title}** (Page {sub.page_number}):")
                lines.append(f"> \"{sub.exact_text[:200]}...\"\n")

        lines.append(f"*(Confidence: {int(top.composite_score * 100)}% based on authority ranking, freshness decay, and semantic matching)*")
        return "\n".join(lines)

llm_provider = LLMProvider()
