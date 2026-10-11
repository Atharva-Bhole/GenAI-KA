import os
import numpy as np
from typing import List, Dict, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
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

    def _embed_local(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension))
        
        # If corpus is small, use TF-IDF directly padded/truncated to dimension
        tfidf = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=512,
            stop_words='english'
        )
        tfidf_mat = tfidf.fit_transform(texts).toarray()
        
        # Normalize vectors
        norms = np.linalg.norm(tfidf_mat, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return tfidf_mat / norms

    def rebuild_index(self, chunks: List[Dict[str, str]]):
        """
        Rebuilds vector index from list of chunk dicts: [{'id': ..., 'text': ...}]
        """
        self.chunk_ids = [c["id"] for c in chunks]
        self.corpus_texts = [c["text"] for c in chunks]
        
        if not self.corpus_texts:
            self.vectors = None
            return

        # Check if external Gemini/OpenAI embedding is enabled
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                embeddings = []
                for text in self.corpus_texts:
                    resp = client.models.embed_content(
                        model="text-embedding-004",
                        contents=text[:2000]
                    )
                    embeddings.append(resp.embedding.values)
                self.vectors = np.array(embeddings, dtype=np.float32)
                norms = np.linalg.norm(self.vectors, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                self.vectors = self.vectors / norms
                return
            except Exception as e:
                print(f"[VectorStore] Gemini embedding fallback to local: {e}")

        # Local semantic TF-IDF embedding
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=1024,
            sublinear_tf=True
        )
        try:
            tfidf_mat = self.vectorizer.fit_transform(self.corpus_texts).toarray()
            # If we have enough samples, compress with SVD for dense semantic latent representation
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
        except Exception as e:
            print(f"[VectorStore] Error building index: {e}")
            self.vectors = np.zeros((len(self.corpus_texts), self.dimension))

    def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """
        Returns list of (chunk_id, similarity_score) where score in [0.0, 1.0]
        """
        if self.vectors is None or len(self.chunk_ids) == 0:
            return []

        try:
            if settings.GEMINI_API_KEY:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                resp = client.models.embed_content(
                    model="text-embedding-004",
                    contents=query
                )
                q_vec = np.array([resp.embedding.values], dtype=np.float32)
                q_norm = np.linalg.norm(q_vec)
                if q_norm > 0:
                    q_vec = q_vec / q_norm
                sims = cosine_similarity(q_vec, self.vectors)[0]
            elif self.vectorizer is not None:
                q_tfidf = self.vectorizer.transform([query]).toarray()
                if self.svd is not None:
                    q_dense = self.svd.transform(q_tfidf)
                else:
                    q_dense = q_tfidf
                q_norm = np.linalg.norm(q_dense)
                if q_norm > 0:
                    q_dense = q_dense / q_norm
                sims = cosine_similarity(q_dense, self.vectors)[0]
            else:
                sims = np.zeros(len(self.chunk_ids))
        except Exception as e:
            print(f"[VectorStore] Search error: {e}")
            return []

        # Convert to [0, 1] range (cosine similarity is in [-1, 1], usually [0, 1])
        normalized_sims = np.clip((sims + 1.0) / 2.0, 0.0, 1.0) if np.min(sims) < 0 else np.clip(sims, 0.0, 1.0)
        
        top_indices = np.argsort(normalized_sims)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = float(normalized_sims[idx])
            results.append((self.chunk_ids[idx], score))
        return results

vector_store = VectorStore()
