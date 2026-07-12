import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Dimensions for the CustomNode
const nodeWidth = 250;
const nodeHeight = 80;

/**
 * Calculates the layout coordinates for nodes using Dagre.
 * @param {Array} nodes - Array of React Flow nodes
 * @param {Array} edges - Array of React Flow edges
 * @param {string} direction - Layout direction ('TB' for top-bottom, 'LR' for left-right)
 * @returns {Object} Object containing positioned nodes and edges
 */
export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

  dagreGraph.setGraph({ rankdir: direction });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated coordinates back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Dagre positions the center of the node, React Flow uses top-left
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      // Target and source handles are calculated correctly by reactflow automatically
    };
  });

  return { nodes: layoutedNodes, edges };
};
