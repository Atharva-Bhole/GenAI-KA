import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.core.config import settings
from app.models.domain import Document
from app.models.schemas import DocumentCreateRequest
from app.services.ingestion.chunker import chunker
from app.services.ingestion.entity_extractor import entity_extractor
from app.services.ingestion.parser import parser
from app.services.storage.bm25_store import bm25_store
from app.services.storage.metadata_db import db
from app.services.storage.vector_store import vector_store

router = APIRouter()

def _reindex_all():
    chunks = db.get_all_chunks()
    entity_extractor.extract_and_link(chunks)
    chunk_dicts = [{"id": c.id, "text": f"{c.document_title} - {c.section_title}: {c.content}"} for c in chunks]
    vector_store.rebuild_index(chunk_dicts)
    bm25_store.rebuild_index(chunk_dicts)

@router.get("", response_model=List[Document])
def list_documents(space_id: Optional[str] = None):
    return db.list_documents(space_id=space_id)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    department: str = Form("General"),
    effective_date: str = Form("2026-01-01"),
    version: str = Form("1.0"),
    authority: str = Form("official_policy"),
    owner: str = Form("Operations"),
    visibility: str = Form("internal"),
    space_id: str = Form("company-wide")
):
    try:
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        filename = file.filename or "uploaded_document.pdf"
        file_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_{filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        segments = parser.parse_file(file_path, filename)
        if not segments:
            segments = [{"page_number": 1, "section_title": "General", "text": "Empty document."}]

        doc = Document(
            id=doc_id,
            filename=filename,
            title=title,
            department=department,
            effective_date=effective_date,
            version=version,
            authority=authority,
            owner=owner,
            visibility=visibility,
            space_id=space_id,
            file_type=os.path.splitext(filename)[1].replace(".", ""),
            file_path=file_path,
            chunk_count=0
        )

        chunks = chunker.chunk_document(doc, segments)
        doc.chunk_count = len(chunks)

        db.insert_document(doc)
        db.insert_chunks(chunks)
        _reindex_all()

        return {"success": True, "document": doc, "chunks_created": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/manual")
def create_manual_document(req: DocumentCreateRequest):
    try:
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        doc = Document(
            id=doc_id,
            filename=f"{req.title.replace(' ', '_')}.md",
            title=req.title,
            department=req.department,
            effective_date=req.effective_date,
            version=req.version,
            authority=req.authority,
            owner=req.owner,
            visibility=req.visibility,
            space_id=req.space_id,
            file_type="markdown",
            chunk_count=0
        )

        segments = [{"page_number": 1, "section_title": "Overview", "text": req.raw_text or req.title}]
        chunks = chunker.chunk_document(doc, segments)
        doc.chunk_count = len(chunks)

        db.insert_document(doc)
        db.insert_chunks(chunks)
        _reindex_all()

        return {"success": True, "document": doc, "chunks_created": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{doc_id}")
def delete_document(doc_id: str):
    doc = db.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete_document(doc_id)
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    _reindex_all()
    return {"success": True, "message": f"Document {doc_id} deleted"}
