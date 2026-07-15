import { api, USE_MOCK } from './api';
import mlMockData from '../mock/machineLearning.json';

/**
 * Generates or fetches a roadmap for a given topic.
 * @param {string} topic - The topic to generate a roadmap for.
 * @returns {Promise<Object>} The roadmap data object.
 */
export const generateRoadmap = async (topic) => {
  if (USE_MOCK) {
    // Mimic a server delay with a 2-second timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mlMockData);
      }, 2000);
    });
  }

  try {
    const response = await api.post('/generate-roadmap', { topic });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roadmap:', error);
    throw error;
  }
};
