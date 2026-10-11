import React, { useEffect, useState } from 'react';
import {
  Layers,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react';
import { fetchKnowledgeGraph } from '../../services/api';
import { GraphNode, KnowledgeGraphData } from '../../types';

export const KnowledgeGraphViewer: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeGraph();
      const total = data.nodes.length;
      const radius = 240;
      const centerX = 380;
      const centerY = 320;

      const layoutNodes = data.nodes.map((n, i) => {
        const angle = (i / Math.max(1, total)) * 2 * Math.PI;
        return {
          ...n,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });

      setGraphData({ nodes: layoutNodes, edges: data.edges });
      if (layoutNodes.length > 0) setSelectedNode(layoutNodes[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const filteredNodes = graphData.nodes.filter(n =>
    n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'policy': return '#14b8a6';
      case 'concept': return '#818cf8';
      case 'role': return '#34d399';
      case 'department': return '#fbbf24';
      case 'security': return '#f43f5e';
      case 'tool': return '#38bdf8';
      default: return '#94a3b8';
    }
  };

  const selectedEdges = graphData.edges.filter(
    e => selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-teal-400" />
          <h2 className="text-sm font-semibold text-white">Enterprise Knowledge Graph</h2>
          <span className="text-[11px] text-slate-400 font-mono ml-2">
            ({graphData.nodes.length} entities • {graphData.edges.length} relationships)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts, policies, roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 outline-none w-64"
            />
          </div>
          <button
            onClick={loadGraph}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-auto bg-radial-gradient flex items-center justify-center p-4">
          <svg width="760" height="640" className="select-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#14b8a6" />
              </marker>
            </defs>

            {graphData.edges.map((edge, idx) => {
              const srcNode = graphData.nodes.find(n => n.id === edge.source);
              const tgtNode = graphData.nodes.find(n => n.id === edge.target);
              if (!srcNode?.x || !srcNode?.y || !tgtNode?.x || !tgtNode?.y) return null;

              const isConnected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

              return (
                <g key={idx}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isConnected ? '#14b8a6' : '#334155'}
                    strokeWidth={isConnected ? 2 : 1}
                    strokeDasharray={isConnected ? 'none' : '2,2'}
                    markerEnd={isConnected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                  />
                  {isConnected && (
                    <text
                      x={(srcNode.x + tgtNode.x) / 2}
                      y={(srcNode.y + tgtNode.y) / 2 - 4}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {graphData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isMatch = searchTerm ? node.label.toLowerCase().includes(searchTerm.toLowerCase()) : true;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 14 : 9}
                    fill={color}
                    opacity={isMatch ? (isSelected ? 1.0 : 0.8) : 0.25}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={(node.y || 0) + 18}
                    fill={isMatch ? '#e2e8f0' : '#475569'}
                    fontSize={isSelected ? '11' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="w-80 border-l border-slate-800 bg-slate-900/80 p-4 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-950 font-mono"
                  style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                >
                  {selectedNode.type}
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department: <strong className="text-slate-300">{selectedNode.department || 'General'}</strong>
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-teal-400" />
                  Active Relationships ({selectedEdges.length})
                </h4>
                {selectedEdges.length === 0 ? (
                  <p className="text-xs text-slate-400">No direct relations recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEdges.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-850 border border-slate-800 text-[11px]"
                      >
                        <span className="text-slate-400">{e.source}</span>
                        <div className="font-mono text-teal-400 text-[10px] my-0.5">
                          ─── {e.relation} ───▶
                        </div>
                        <span className="text-slate-200 font-medium">{e.target}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span className="font-medium text-slate-300">How the Assistant uses this:</span>
                <p className="mt-1 leading-relaxed">
                  During query decomposition, multi-hop traversals resolve interdependent policies across travel expenses, annual leave allowances, and remote work guidelines without requiring manual user linking.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select an entity node on the canvas to inspect its multi-hop connections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
