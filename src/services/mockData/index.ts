// Export all mock data from a single file
import { mockPropertiesData } from './properties';
import { mockSmartLocksData } from './smartLocks';
import { mockTransactionsData } from './transactions';
import { mockAccessKeysData } from './accessKeys';
import { PropertyData } from '../apiAdapter';

export const mockProperties = mockPropertiesData;
export const mockSmartLocks = mockSmartLocksData;
export const mockTransactions = mockTransactionsData;
export const mockAccessKeys = mockAccessKeysData;

// Add creation timestamps to mock data if needed
const addMissingFields = (properties: PropertyData[]) => {
  return properties.map((property, index) => {
    const now = new Date();
    // Create staggered timestamps so older items appear created before newer ones
    const daysAgo = properties.length - index;
    const timestamp = new Date(now.getTime() - daysAgo * 86400000).toISOString();
    
    return {
      ...property,
      created_at: property.created_at || timestamp,
      name: property.name || property.title,
      title: property.title || property.name,
      is_available: property.is_available !== undefined ? property.is_available : property.availability,
      smart_lock_id: property.smart_lock_id || property.smartLockId || `lock-${property.id}`,
      smartLockId: property.smartLockId || property.smart_lock_id || `lock-${property.id}`,
      min_duration: property.min_duration || 1,
      max_duration: property.max_duration || 30,
      price_per_day: property.price_per_day || property.price,
    };
  });
};

// Initialize mock data with localStorage if available
export const initializeMockData = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Process the base mock data to ensure consistent fields
    const processedMockData = addMissingFields(mockPropertiesData);
    
    // Get any stored properties from localStorage
    const storedPropertiesString = localStorage.getItem('mockProperties');
    if (storedPropertiesString) {
      const storedProperties: PropertyData[] = JSON.parse(storedPropertiesString);
      
      // Filter out duplicates by ID
      const existingIds = new Set(processedMockData.map(p => p.id));
      const filteredStoredProperties = storedProperties.filter(p => !existingIds.has(p.id));
      
      // Update the stored properties with any missing fields
      const processedStoredProperties = addMissingFields(filteredStoredProperties);
      
      // Combine all properties and save back to localStorage
      const allProperties = [...processedMockData, ...processedStoredProperties];
      localStorage.setItem('mockProperties', JSON.stringify(allProperties));
    } else {
      // If no stored properties, initialize localStorage with the processed mock data
      localStorage.setItem('mockProperties', JSON.stringify(processedMockData));
    }
  } catch (err) {
    console.warn('Error initializing mock data from localStorage:', err);
  }
};

export default {
  mockProperties,
  mockSmartLocks,
  mockTransactions,
  mockAccessKeys,
  initializeMockData,
};
