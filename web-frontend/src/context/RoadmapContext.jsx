import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateRoadmap } from '../services/roadmapService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const RoadmapContext = createContext(null);

export const RoadmapProvider = ({ children }) => {
  const [currentTopic, setCurrentTopic] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  
  // Persist completed nodes in local storage to maintain state across refreshes
  const [completedNodes, setCompletedNodes] = useLocalStorage('nexus_completed_nodes', []);
  
  const [activeNode, setActiveNode] = useState(null);
  const [loadingState, setLoadingState] = useState(false);

  const setTopic = useCallback((topic) => {
    setCurrentTopic(topic);
  }, []);

  const fetchRoadmap = useCallback(async (topic) => {
    try {
      setLoadingState(true);
      setTopic(topic);
      // Reset state for new roadmap, but optionally we could keep completedNodes 
      // if we were storing them per-topic. For now, clearing on new roadmap generation.
      setRoadmapData(null);
      setActiveNode(null);
      // setCompletedNodes([]); // Commented out to allow persistence between sessions if testing same roadmap
      
      const data = await generateRoadmap(topic);
      setRoadmapData(data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoadingState(false);
    }
  }, [setTopic]);

  const toggleNodeCompletion = useCallback((nodeId) => {
    setCompletedNodes((prev) => 
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  }, [setCompletedNodes]);

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
