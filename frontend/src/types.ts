export interface Citation {
  document_id: string;
  document_title: string;
  department: string;
  page_number: number;
  section_title: string;
  exact_text: string;
  effective_date: string;
  version: string;
  authority: string;
  semantic_score: number;
  bm25_score: number;
  authority_score: number;
  freshness_score: number;
  composite_score: number;
}

export interface ConflictReport {
  has_conflict: boolean;
  title: string;
  discrepancy_details: string;
  source_a: string;
  version_a: string;
  claim_a: string;
  source_b: string;
  version_b: string;
  claim_b: string;
  authoritative_source: string;
  recommended_answer: string;
  confidence: number;
}

export interface PlanStep {
  step_id: number;
  title: string;
  description: string;
  targeted_sources: string[];
  status: 'pending' | 'in_progress' | 'completed';
  findings: string;
}

export interface ActionRequest {
  action_type: 'leave_request' | 'jira_ticket' | 'email_notification';
  title: string;
  parameters: Record<string, any>;
  requires_confirmation: boolean;
  status: 'proposed' | 'executed' | 'cancelled';
  execution_result?: Record<string, any>;
}

export interface KnowledgeGapRecord {
  id: string;
  query: string;
  space_id: string;
  department: string;
  detected_at: string;
  confidence_score: number;
  closest_sources: string[];
  status: 'open' | 'assigned' | 'resolved';
  owner_contact: string;
}

export interface QueryResponse {
  query: string;
  answer: string;
  confidence_score: number;
  citations: Citation[];
  conflict_report?: ConflictReport | null;
  plan_steps?: PlanStep[] | null;
  proposed_action?: ActionRequest | null;
  knowledge_gap?: KnowledgeGapRecord | null;
  complexity_category: string;
  strategy_used: string;
  retrieval_latency_ms: number;
  total_latency_ms: number;
  active_space: string;
  provider_used?: string;
  suggested_followups?: string[];
}

export interface GeminiConfigStatus {
  configured: boolean;
  active_provider: string;
  model: string;
  embedding_model: string;
  has_api_key: boolean;
  total_indexed_chunks: number;
  gemini_vectors_active: boolean;
}

export interface Document {
  id: string;
  filename: string;
  title: string;
  department: string;
  effective_date: string;
  version: string;
  authority: string;
  owner: string;
  visibility: string;
  space_id: string;
  file_type: string;
  chunk_count: number;
  created_at: string;
  last_updated: string;
}

export interface KnowledgeSpace {
  id: string;
  name: string;
  description: string;
  department: string;
  icon: string;
  document_count: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  department?: string;
  metadata?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BenchmarkMetric {
  strategy: string;
  accuracy_score: number;
  faithfulness_score: number;
  context_precision: number;
  citation_accuracy: number;
  hallucination_rate: number;
  avg_latency_ms: number;
  test_queries_count: number;
}

export interface BenchmarkRunResponse {
  timestamp: string;
  evaluations: BenchmarkMetric[];
  sample_comparisons: Array<{
    query: string;
    results: Record<string, {
      answer_preview: string;
      top_source: string;
      confidence: number;
      conflict_caught: boolean;
      latency_ms: number;
    }>;
  }>;
}

export interface AnalyticsStats {
  total_queries: number;
  avg_latency_ms: number;
  avg_confidence: number;
  conflicts_detected: number;
  gaps_detected: number;
  recent_logs: any[];
}

