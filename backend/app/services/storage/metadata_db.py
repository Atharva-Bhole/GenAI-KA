import json
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.models.domain import Chunk, Document, KnowledgeGapRecord, KnowledgeSpace

class MetadataDB:
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                title TEXT NOT NULL,
                department TEXT NOT NULL,
                effective_date TEXT NOT NULL,
                version TEXT NOT NULL,
                authority TEXT NOT NULL,
                owner TEXT NOT NULL,
                visibility TEXT NOT NULL,
                space_id TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_path TEXT,
                chunk_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                last_updated TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                document_title TEXT NOT NULL,
                department TEXT NOT NULL,
                page_number INTEGER DEFAULT 1,
                section_title TEXT NOT NULL,
                content TEXT NOT NULL,
                effective_date TEXT NOT NULL,
                version TEXT NOT NULL,
                authority TEXT NOT NULL,
                entities_json TEXT DEFAULT '[]',
                FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_spaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                department TEXT NOT NULL,
                icon TEXT DEFAULT 'folder',
                created_at TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_gaps (
                id TEXT PRIMARY KEY,
                query TEXT NOT NULL,
                space_id TEXT NOT NULL,
                department TEXT NOT NULL,
                detected_at TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                closest_sources_json TEXT DEFAULT '[]',
                status TEXT DEFAULT 'open',
                owner_contact TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                space_id TEXT NOT NULL,
                strategy TEXT NOT NULL,
                confidence REAL NOT NULL,
                latency_ms REAL NOT NULL,
                had_conflict INTEGER DEFAULT 0,
                had_gap INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """)

            conn.commit()

    def insert_document(self, doc: Document):
        with self._get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO documents (
                id, filename, title, department, effective_date, version, authority,
                owner, visibility, space_id, file_type, file_path, chunk_count, created_at, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                doc.id, doc.filename, doc.title, doc.department, doc.effective_date,
                doc.version, doc.authority, doc.owner, doc.visibility, doc.space_id,
                doc.file_type, doc.file_path, doc.chunk_count, doc.created_at, doc.last_updated
            ))
            conn.commit()

    def get_document(self, doc_id: str) -> Optional[Document]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
            if row:
                return Document(**dict(row))
        return None

    def list_documents(self, space_id: Optional[str] = None) -> List[Document]:
        with self._get_connection() as conn:
            if space_id and space_id != "company-wide":
                rows = conn.execute("SELECT * FROM documents WHERE space_id = ? ORDER BY effective_date DESC", (space_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM documents ORDER BY effective_date DESC").fetchall()
            return [Document(**dict(r)) for r in rows]

    def delete_document(self, doc_id: str):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM chunks WHERE document_id = ?", (doc_id,))
            conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            conn.commit()

    def insert_chunks(self, chunks: List[Chunk]):
        with self._get_connection() as conn:
            for c in chunks:
                conn.execute("""
                INSERT OR REPLACE INTO chunks (
                    id, document_id, document_title, department, page_number,
                    section_title, content, effective_date, version, authority, entities_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    c.id, c.document_id, c.document_title, c.department, c.page_number,
                    c.section_title, c.content, c.effective_date, c.version, c.authority,
                    json.dumps(c.entities)
                ))
            conn.commit()

    def get_all_chunks(self, space_id: Optional[str] = None) -> List[Chunk]:
        with self._get_connection() as conn:
            if space_id and space_id != "company-wide":
                rows = conn.execute("""
                SELECT c.* FROM chunks c
                JOIN documents d ON c.document_id = d.id
                WHERE d.space_id = ?
                """, (space_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM chunks").fetchall()
            
            chunks = []
            for r in rows:
                d = dict(r)
                entities = json.loads(d.pop("entities_json", "[]"))
                chunks.append(Chunk(**d, entities=entities))
            return chunks

    def insert_space(self, space: KnowledgeSpace):
        with self._get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO knowledge_spaces (id, name, description, department, icon, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (space.id, space.name, space.description, space.department, space.icon, space.created_at))
            conn.commit()

    def list_spaces(self) -> List[KnowledgeSpace]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM knowledge_spaces").fetchall()
            spaces = []
            for r in rows:
                s_dict = dict(r)
                cnt = conn.execute("SELECT COUNT(*) FROM documents WHERE space_id = ?", (s_dict["id"],)).fetchone()[0]
                s_dict["document_count"] = cnt
                spaces.append(KnowledgeSpace(**s_dict))
            return spaces

    def insert_gap(self, gap: KnowledgeGapRecord):
        with self._get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO knowledge_gaps (
                id, query, space_id, department, detected_at, confidence_score,
                closest_sources_json, status, owner_contact
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                gap.id, gap.query, gap.space_id, gap.department, gap.detected_at,
                gap.confidence_score, json.dumps(gap.closest_sources), gap.status, gap.owner_contact
            ))
            conn.commit()

    def list_gaps(self) -> List[KnowledgeGapRecord]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM knowledge_gaps ORDER BY detected_at DESC").fetchall()
            gaps = []
            for r in rows:
                d = dict(r)
                sources = json.loads(d.pop("closest_sources_json", "[]"))
                gaps.append(KnowledgeGapRecord(**d, closest_sources=sources))
            return gaps

    def resolve_gap(self, gap_id: str):
        with self._get_connection() as conn:
            conn.execute("UPDATE knowledge_gaps SET status = 'resolved' WHERE id = ?", (gap_id,))
            conn.commit()

    def log_query(self, query: str, space_id: str, strategy: str, confidence: float, latency_ms: float, had_conflict: bool, had_gap: bool):
        with self._get_connection() as conn:
            conn.execute("""
            INSERT INTO query_logs (query, space_id, strategy, confidence, latency_ms, had_conflict, had_gap, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (query, space_id, strategy, confidence, latency_ms, 1 if had_conflict else 0, 1 if had_gap else 0, datetime.now().isoformat()))
            conn.commit()

    def get_query_stats(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            total = conn.execute("SELECT COUNT(*) FROM query_logs").fetchone()[0]
            avg_lat = conn.execute("SELECT AVG(latency_ms) FROM query_logs").fetchone()[0] or 0.0
            avg_conf = conn.execute("SELECT AVG(confidence) FROM query_logs").fetchone()[0] or 0.0
            conflicts = conn.execute("SELECT COUNT(*) FROM query_logs WHERE had_conflict = 1").fetchone()[0]
            gaps = conn.execute("SELECT COUNT(*) FROM query_logs WHERE had_gap = 1").fetchone()[0]
            recent = conn.execute("SELECT * FROM query_logs ORDER BY id DESC LIMIT 10").fetchall()
            return {
                "total_queries": total,
                "avg_latency_ms": round(avg_lat, 2),
                "avg_confidence": round(avg_conf, 2),
                "conflicts_detected": conflicts,
                "gaps_detected": gaps,
                "recent_logs": [dict(r) for r in recent]
            }

db = MetadataDB()
