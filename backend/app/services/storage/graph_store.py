from typing import Any, Dict, List, Optional
import networkx as nx
from app.models.domain import GraphEdge, GraphNode

class KnowledgeGraphStore:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, label: str, node_type: str, department: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
        self.graph.add_node(
            node_id,
            label=label,
            type=node_type,
            department=department or "General",
            metadata=metadata or {}
        )

    def add_edge(self, source: str, target: str, relation: str, weight: float = 1.0):
        if not self.graph.has_node(source):
            self.add_node(source, source, "Concept")
        if not self.graph.has_node(target):
            self.add_node(target, target, "Concept")
        
        self.graph.add_edge(source, target, relation=relation, weight=weight)

    def get_related_entities(self, query_terms: List[str], hops: int = 2) -> List[str]:
        matched_nodes = []
        lower_terms = [t.lower() for t in query_terms]

        for node, data in self.graph.nodes(data=True):
            node_str = f"{node} {data.get('label', '')}".lower()
            if any(term in node_str for term in lower_terms):
                matched_nodes.append(node)

        expanded_nodes = set(matched_nodes)
        for m_node in matched_nodes:
            for target in nx.single_source_shortest_path_length(self.graph, m_node, cutoff=hops).keys():
                expanded_nodes.add(target)
            for pred in nx.single_source_shortest_path_length(self.graph.reverse(), m_node, cutoff=hops).keys():
                expanded_nodes.add(pred)

        return list(expanded_nodes)

    def export_graph_data(self) -> Dict[str, Any]:
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append(GraphNode(
                id=str(n),
                label=d.get("label", str(n)),
                type=d.get("type", "Concept"),
                department=d.get("department", "General"),
                metadata=d.get("metadata", {})
            ))

        edges = []
        for u, v, d in self.graph.edges(data=True):
            edges.append(GraphEdge(
                source=str(u),
                target=str(v),
                relation=d.get("relation", "relates_to"),
                weight=float(d.get("weight", 1.0))
            ))

        return {"nodes": [n.model_dump() for n in nodes], "edges": [e.model_dump() for e in edges]}

    def clear(self):
        self.graph.clear()

graph_store = KnowledgeGraphStore()
