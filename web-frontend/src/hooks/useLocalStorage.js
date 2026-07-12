import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state synchronized with window.localStorage
 * @param {string} key - The key under which the data is stored in localStorage
 * @param {any} initialValue - The fallback value if no data exists
 * @returns {[any, Function]} - The state value and the setter function
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with the value from localStorage or the initial fallback
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  // Wrap the state setter to also write to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };

  return [storedValue, setValue];
}
