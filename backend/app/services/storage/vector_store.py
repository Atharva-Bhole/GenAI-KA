from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.chunk_ids: List[str] = []
        self.corpus_texts: List[str] = []
        self.vectors: Optional[np.ndarray] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.svd: Optional[TruncatedSVD] = None
        self.dimension: int = 128
        self.gemini_vectors_active: bool = False

    def rebuild_index(self, chunks: List[Dict[str, str]]):
        self.chunk_ids = [c["id"] for c in chunks]
        self.corpus_texts = [c["text"] for c in chunks]
        self.gemini_vectors_active = False
        
        if not self.corpus_texts:
            self.vectors = None
            return

        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                all_embeddings = []
                batch_size = 10
                
                for i in range(0, len(self.corpus_texts), batch_size):
                    batch = self.corpus_texts[i:i + batch_size]
                    trimmed = [t[:1800] for t in batch]
                    resp = client.models.embed_content(
                        model="text-embedding-004",
                        contents=trimmed
                    )
                    if hasattr(resp, 'embeddings') and resp.embeddings:
                        for emb in resp.embeddings:
                            all_embeddings.append(emb.values)
                
                if len(all_embeddings) == len(self.corpus_texts):
                    self.vectors = np.array(all_embeddings, dtype=np.float32)
                    norms = np.linalg.norm(self.vectors, axis=1, keepdims=True)
                    norms[norms == 0] = 1.0
                    self.vectors = self.vectors / norms
                    self.gemini_vectors_active = True
                    return
            except Exception:
                self.gemini_vectors_active = False

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=1024,
            sublinear_tf=True
        )
        try:
            tfidf_mat = self.vectorizer.fit_transform(self.corpus_texts).toarray()
            n_samples, n_features = tfidf_mat.shape
            if n_samples > 4 and n_features > 10:
                n_comp = min(self.dimension, n_samples - 1, n_features - 1)
                self.svd = TruncatedSVD(n_components=n_comp, random_state=42)
                dense_vecs = self.svd.fit_transform(tfidf_mat)
            else:
                dense_vecs = tfidf_mat
                
            norms = np.linalg.norm(dense_vecs, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self.vectors = dense_vecs / norms
        except Exception:
            self.vectors = np.zeros((len(self.corpus_texts), self.dimension))

    def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        if self.vectors is None or len(self.chunk_ids) == 0:
            return []

        try:
            if settings.GEMINI_API_KEY and self.gemini_vectors_active:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                resp = client.models.embed_content(
                    model="text-embedding-004",
                    contents=query[:1800]
                )
                if hasattr(resp, 'embeddings') and resp.embeddings:
                    q_vals = resp.embeddings[0].values
                    q_vec = np.array([q_vals], dtype=np.float32)
                    q_norm = np.linalg.norm(q_vec)
                    if q_norm > 0:
                        q_vec = q_vec / q_norm
                    sims = cosine_similarity(q_vec, self.vectors)[0]
                else:
                    sims = np.zeros(len(self.chunk_ids))
            elif self.vectorizer is not None:
                q_tfidf = self.vectorizer.transform([query]).toarray()
                q_dense = self.svd.transform(q_tfidf) if self.svd is not None else q_tfidf
                q_norm = np.linalg.norm(q_dense)
                if q_norm > 0:
                    q_dense = q_dense / q_norm
                sims = cosine_similarity(q_dense, self.vectors)[0]
            else:
                sims = np.zeros(len(self.chunk_ids))
        except Exception:
            if self.vectorizer is not None:
                try:
                    q_tfidf = self.vectorizer.transform([query]).toarray()
                    q_dense = self.svd.transform(q_tfidf) if self.svd is not None else q_tfidf
                    sims = cosine_similarity(q_dense, self.vectors)[0]
                except Exception:
                    return []
            else:
                return []

        normalized_sims = np.clip((sims + 1.0) / 2.0, 0.0, 1.0) if np.min(sims) < 0 else np.clip(sims, 0.0, 1.0)
        top_indices = np.argsort(normalized_sims)[::-1][:top_k]
        
        return [(self.chunk_ids[idx], float(normalized_sims[idx])) for idx in top_indices]

vector_store = VectorStore()
