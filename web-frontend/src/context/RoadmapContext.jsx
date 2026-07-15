import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateRoadmap } from '../services/roadmapService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const RoadmapContext = createContext(null);

const getTopicSlug = (topic) => (topic || '').toLowerCase().trim().replace(/\s+/g, '-');

export const RoadmapProvider = ({ children }) => {
  const [currentTopic, setCurrentTopic] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);

  // Stored as { [topicSlug]: [nodeId, nodeId, ...] } so completion doesn't
  // bleed between different topics whose node IDs happen to overlap
  // (every roadmap restarts numbering at "1").
  const [completedByTopic, setCompletedByTopic] = useLocalStorage('nexus_completed_nodes_v2', {});

  const [activeNode, setActiveNode] = useState(null);
  const [loadingState, setLoadingState] = useState(false);

  const setTopic = useCallback((topic) => {
    setCurrentTopic(topic);
  }, []);

  const fetchRoadmap = useCallback(async (topic) => {
    try {
      setLoadingState(true);
      setTopic(topic);
      setRoadmapData(null);
      setActiveNode(null);

      const data = await generateRoadmap(topic);
      setRoadmapData(data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoadingState(false);
    }
  }, [setTopic]);

  const slug = getTopicSlug(currentTopic);
  const completedNodes = completedByTopic[slug] || [];

  const toggleNodeCompletion = useCallback(
    (nodeId) => {
      setCompletedByTopic((prev) => {
        const current = prev[slug] || [];
        const updated = current.includes(nodeId)
          ? current.filter((id) => id !== nodeId)
          : [...current, nodeId];
        return { ...prev, [slug]: updated };
      });
    },
    [setCompletedByTopic, slug]
  );

  return (
    <RoadmapContext.Provider
      value={{
        currentTopic,
        roadmapData,
        completedNodes,
        activeNode,
        loadingState,
        setTopic,
        fetchRoadmap,
        toggleNodeCompletion,
        setActiveNode,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};