import type {
  QueryResponse,
  Document,
  KnowledgeSpace,
  KnowledgeGraphData,
  KnowledgeGapRecord,
  AnalyticsStats,
  BenchmarkRunResponse
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export async function sendQuery(payload: {
  query: string;
  space_id?: string;
  research_mode?: boolean;
  strategy?: string;
  user_role?: string;
  user_id?: string;
}): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Query failed' }));
    throw new Error(err.detail || 'Network error');
  }
  return res.json();
}

export async function fetchDocuments(spaceId?: string): Promise<Document[]> {
  const url = spaceId && spaceId !== 'company-wide' 
    ? `${API_BASE}/documents?space_id=${spaceId}` 
    : `${API_BASE}/documents`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Document upload failed');
  return res.json();
}

export async function deleteDocument(docId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function fetchSpaces(): Promise<KnowledgeSpace[]> {
  const res = await fetch(`${API_BASE}/spaces`);
  if (!res.ok) throw new Error('Failed to fetch spaces');
  return res.json();
}

export async function fetchKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph data');
  return res.json();
}

export async function executeAction(actionType: string, parameters: Record<string, any>, userId = 'atharva'): Promise<any> {
  const res = await fetch(`${API_BASE}/actions/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_type: actionType,
      parameters,
      user_id: userId,
    }),
  });
  if (!res.ok) throw new Error('Action execution failed');
  return res.json();
}

export async function fetchKnowledgeGaps(): Promise<KnowledgeGapRecord[]> {
  const res = await fetch(`${API_BASE}/governance/gaps`);
  if (!res.ok) throw new Error('Failed to fetch knowledge gaps');
  return res.json();
}

export async function resolveGap(gapId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/governance/gaps/${gapId}/resolve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to resolve knowledge gap');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsStats> {
  const res = await fetch(`${API_BASE}/governance/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function runBenchmarkEvaluation(): Promise<BenchmarkRunResponse> {
  const res = await fetch(`${API_BASE}/benchmark/run`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Benchmark execution failed');
  return res.json();
}
