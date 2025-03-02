'use client';

import React, { useEffect } from 'react';
import { initializeMockData } from '@/services/mockData';

interface MockDataProviderProps {
  children: React.ReactNode;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize mock data from localStorage when component mounts
    initializeMockData();
  }, []);

  return <>{children}</>;
};