'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

interface ModeContextType {
  isDemoMode: boolean;
  toggleMode: () => void;
  setDemoMode: (isDemoMode: boolean) => void;
}

// Create context with default values
const ModeContext = createContext<ModeContextType>({
  isDemoMode: true, // Default to demo mode
  toggleMode: () => {},
  setDemoMode: () => {}
});

export const useMode = () => useContext(ModeContext);

interface ModeProviderProps {
  children: React.ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  // Default to demo mode for hackathon presentation, but allow switching
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Check if mode preference was previously set - client-side only
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const savedMode = localStorage.getItem('appMode');
    if (savedMode) {
      setIsDemoMode(savedMode === 'demo');
    }
    
    setMounted(true);
  }, []);

  // Toggle between demo and real mode
  const toggleMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    // Only use localStorage on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('appMode', newMode ? 'demo' : 'real');
    }
  };

  // Set mode directly
  const handleSetDemoMode = (isDemoMode: boolean) => {
    setIsDemoMode(isDemoMode);
    
    // Only use localStorage on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('appMode', isDemoMode ? 'demo' : 'real');
    }
  };

  return (
    <ModeContext.Provider
      value={{
        isDemoMode,
        toggleMode,
        setDemoMode: handleSetDemoMode
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export default ModeContext;