import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // Important!
import { useRoadmap } from '../context/RoadmapContext';
import { getLayoutedElements } from '../utils/graphLayout';
import CustomNode from '../components/CustomNode';
import Sidebar from '../components/Sidebar';
import { ArrowLeft } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

export default function RoadmapPage() {
  const { roadmapData, setActiveNode } = useRoadmap();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // If user refreshes or accesses page without generating a roadmap, redirect back
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
        difficulty: node.difficulty,
        estimatedTime: node.estimatedTime,
        fullNodeData: node // So we can easily pass it to context on click
      },
    }));

    const initialEdges = roadmapData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#475569', strokeWidth: 2 },
    }));

    // Compute layout using dagre
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB' // Top to Bottom
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    // Reset active node when roadmap changes
    setActiveNode(null);
  }, [roadmapData, navigate, setNodes, setEdges, setActiveNode]);

  const onNodeClick = useCallback((event, node) => {
    setActiveNode(node.data.fullNodeData);
  }, [setActiveNode]);

  return (
    <div className="flex-1 w-full h-full relative flex flex-col">
      {/* Navigation and Title Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
         <button 
           onClick={() => navigate('/')} 
           className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md shadow-lg"
         >
           <ArrowLeft size={16} />
           Back to Hub
         </button>
         {roadmapData && (
           <h1 className="text-xl font-bold text-white tracking-tight bg-slate-900/80 px-5 py-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-lg">
             {roadmapData.topic}
           </h1>
         )}
      </div>

      {/* The Canvas Area */}
      <div className="flex-1 w-full relative"> 
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#334155" variant={BackgroundVariant.Dots} gap={20} size={1.5} />
          
          <Controls 
            className="bg-slate-900 border-slate-700 fill-slate-300 [&>button]:border-b-slate-700 [&>button:hover]:bg-slate-800 rounded-lg overflow-hidden shadow-xl" 
          />
          
          <MiniMap 
            nodeColor={(node) => {
              if (node.data.difficulty === 'Beginner') return '#22c55e';
              if (node.data.difficulty === 'Intermediate') return '#f97316';
              if (node.data.difficulty === 'Advanced') return '#ef4444';
              return '#475569';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            className="bg-slate-900 border-slate-700 rounded-xl overflow-hidden shadow-xl"
          />
        </ReactFlow>
      </div>

      <Sidebar />
    </div>
  );
}
