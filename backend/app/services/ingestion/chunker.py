import uuid
from typing import Any, Dict, List
from app.models.domain import Chunk, Document

class SemanticChunker:
    def __init__(self, target_chunk_size: int = 650, chunk_overlap: int = 120):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, doc: Document, parsed_segments: List[Dict[str, Any]]) -> List[Chunk]:
        chunks: List[Chunk] = []

        for seg in parsed_segments:
            page = seg.get("page_number", 1)
            section = seg.get("section_title", "General")
            text = seg.get("text", "").strip()

            if not text:
                continue

            if len(text) <= self.target_chunk_size:
                chunks.append(Chunk(
                    id=str(uuid.uuid4()),
                    document_id=doc.id,
                    document_title=doc.title,
                    department=doc.department,
                    page_number=page,
                    section_title=section,
                    content=text,
                    effective_date=doc.effective_date,
                    version=doc.version,
                    authority=doc.authority,
                    entities=[]
                ))
            else:
                start = 0
                while start < len(text):
                    end = min(start + self.target_chunk_size, len(text))
                    
                    if end < len(text):
                        split_idx = text.rfind("\n", start, end)
                        if split_idx == -1 or split_idx < start + (self.target_chunk_size // 2):
                            split_idx = text.rfind(". ", start, end)
                        if split_idx != -1 and split_idx > start + 100:
                            end = split_idx + 1

                    chunk_text = text[start:end].strip()
                    if chunk_text:
                        chunks.append(Chunk(
                            id=str(uuid.uuid4()),
                            document_id=doc.id,
                            document_title=doc.title,
                            department=doc.department,
                            page_number=page,
                            section_title=section,
                            content=chunk_text,
                            effective_date=doc.effective_date,
                            version=doc.version,
                            authority=doc.authority,
                            entities=[]
                        ))

                    if end >= len(text):
                        break
                    start = end - self.chunk_overlap

        return chunks

chunker = SemanticChunker()
