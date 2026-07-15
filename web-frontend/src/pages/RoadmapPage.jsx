import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRoadmap } from '../context/RoadmapContext';
import { getLayoutedElements } from '../utils/graphLayout';
import CustomNode from '../components/CustomNode';
import Sidebar from '../components/Sidebar';
import { ArrowLeft } from 'lucide-react';

const nodeTypes = { custom: CustomNode };

export default function RoadmapPage() {
  const { roadmapData, currentTopic, setActiveNode } = useRoadmap();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!roadmapData) {
      navigate('/');
      return;
    }

    const initialNodes = roadmapData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        title: node.title,
        description: node.description,
        fullNodeData: node,
      },
    }));

    // Backend edges only have source/target — generate a stable id here.
    const initialEdges = roadmapData.edges.map((edge) => ({
      id: `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#a5b4fc', strokeWidth: 2 },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB'
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setActiveNode(null);
  }, [roadmapData, navigate, setNodes, setEdges, setActiveNode]);

  const onNodeClick = useCallback(
    (event, node) => setActiveNode(node.data.fullNodeData),
    [setActiveNode]
  );

  return (
    <div className="flex-1 w-full h-full relative flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {currentTopic && (
          <h1 className="text-sm font-semibold text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            {currentTopic}
          </h1>
        )}
      </div>

      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" variant={BackgroundVariant.Dots} gap={20} size={1.5} />
          <Controls className="!shadow-sm !border !border-slate-200 !rounded-xl" showInteractive={false} />
          <MiniMap
            nodeColor="#c7d2fe"
            maskColor="rgba(248, 250, 252, 0.7)"
            className="!border !border-slate-200 !rounded-xl !shadow-sm"
          />
        </ReactFlow>
      </div>

      <Sidebar />
    </div>
  );
}