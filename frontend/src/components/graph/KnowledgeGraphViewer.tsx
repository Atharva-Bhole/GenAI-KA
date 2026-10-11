import React, { useEffect, useState } from 'react';
import {
  Layers,
  Network,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { fetchKnowledgeGraph } from '../../services/api';
import { GraphNode, KnowledgeGraphData } from '../../types';

export const KnowledgeGraphViewer: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeGraph();
      const total = data.nodes.length;
      const radius = 240;
      const centerX = 390;
      const centerY = 330;

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

  const nodeTypes = ['all', 'policy', 'concept', 'role', 'department', 'tool'];

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
    (e) => selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-dark-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Share2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Enterprise Knowledge Graph</h2>
              <span className="px-2 py-0.5 rounded-full bg-dark-800 border border-white/[0.05] text-[10px] font-mono text-brand-300">
                {graphData.nodes.length} entities • {graphData.edges.length} relations
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live multi-hop semantic relationship network supporting cross-policy query decomposition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter entities, concepts, policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-850 text-slate-200 placeholder-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.07] focus:border-brand-500/60 outline-none w-56 sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={loadGraph}
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-white/[0.05] hover:border-white/[0.1] transition-all"
            title="Refresh Knowledge Graph"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-dark-900/40 border-b border-white/[0.05] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Network className="h-3 w-3 text-slate-400" />
          Filter:
        </span>
        {nodeTypes.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTypeFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
              selectedTypeFilter === t
                ? 'bg-brand-500 text-dark-950 font-bold shadow-md shadow-brand-500/20'
                : 'bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-slate-200 border border-white/[0.05]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-auto bg-dot-pattern flex items-center justify-center p-6 bg-dark-950">
          <svg width="780" height="660" className="select-none filter drop-shadow-2xl">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#334155" />
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
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {graphData.edges.map((edge, idx) => {
              const srcNode = graphData.nodes.find((n) => n.id === edge.source);
              const tgtNode = graphData.nodes.find((n) => n.id === edge.target);
              if (!srcNode?.x || !srcNode?.y || !tgtNode?.x || !tgtNode?.y) return null;

              const isConnected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

              return (
                <g key={idx}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isConnected ? '#14b8a6' : '#262f40'}
                    strokeWidth={isConnected ? 2.5 : 1}
                    strokeDasharray={isConnected ? 'none' : '3,3'}
                    markerEnd={isConnected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    className="transition-all duration-300"
                  />
                  {isConnected && (
                    <g>
                      <rect
                        x={(srcNode.x + tgtNode.x) / 2 - 40}
                        y={(srcNode.y + tgtNode.y) / 2 - 14}
                        width="80"
                        height="16"
                        rx="4"
                        fill="#0c111d"
                        stroke="#14b8a6"
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x={(srcNode.x + tgtNode.x) / 2}
                        y={(srcNode.y + tgtNode.y) / 2 - 3}
                        fill="#5eead4"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {edge.relation}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {graphData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const matchesSearch = searchTerm ? node.label.toLowerCase().includes(searchTerm.toLowerCase()) : true;
              const matchesType = selectedTypeFilter === 'all' || node.type.toLowerCase() === selectedTypeFilter;
              const isVisible = matchesSearch && matchesType;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="22"
                      fill={color}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 14 : 9}
                    fill={color}
                    opacity={isVisible ? (isSelected ? 1.0 : 0.85) : 0.15}
                    stroke={isSelected ? '#ffffff' : '#030712'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={node.x}
                    y={(node.y || 0) + 20}
                    fill={isVisible ? (isSelected ? '#ffffff' : '#cbd5e1') : '#334155'}
                    fontSize={isSelected ? '11' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="w-80 sm:w-88 border-l border-white/[0.07] bg-dark-900/90 backdrop-blur-2xl p-5 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-5">
              <div>
                <span
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-dark-950 font-mono inline-block shadow-sm"
                  style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                >
                  {selectedNode.type}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 leading-tight">
                  {selectedNode.label}
                </h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>Scope:</span>
                  <strong className="text-slate-200">{selectedNode.department || 'Enterprise Wide'}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.07]">
                <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-brand-400" />
                    Direct Traversal Links
                  </span>
                  <span className="text-[10px] font-mono text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                    {selectedEdges.length} connections
                  </span>
                </h4>

                {selectedEdges.length === 0 ? (
                  <p className="text-xs text-slate-400">No active links registered for this entity node.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEdges.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-dark-850/80 border border-white/[0.05] text-[11px] hover:border-brand-500/30 transition-all"
                      >
                        <div className="text-slate-400 truncate">{e.source}</div>
                        <div className="font-mono text-brand-400 text-[10px] my-1 flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" />
                          <span>{e.relation}</span>
                          <span>→</span>
                        </div>
                        <div className="text-slate-200 font-semibold truncate">{e.target}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.07] p-3.5 rounded-2xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-slate-300 space-y-2">
                <div className="font-bold text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                  <span>Multi-Hop Reasoning Engine</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  During intent decomposition, the planner traverses these relationship edges to cross-reference entitlements across separate documents without requiring manual cross-linking.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Network className="h-10 w-10 mx-auto text-slate-400 mb-3" />
              <p className="font-medium text-slate-300">Select an Entity Node</p>
              <p className="text-[11px] text-slate-400 mt-1">Click any circle in the graph to inspect multi-hop traversal paths.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
