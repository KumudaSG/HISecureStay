import axios from 'axios';

// Base URL of the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints for properties
export const propertyAPI = {
  // Get all properties
  getAllProperties: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  // Get properties owned by a specific wallet address
  getMyProperties: async (walletAddress: string) => {
    const response = await api.get(`/properties/user/${walletAddress}`);
    return response.data;
  },
  
  // Get a specific property by ID
  getPropertyById: async (id: number) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  // Create a new property listing
  createProperty: async (propertyData: any) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  
  // Book a property
  bookProperty: async (propertyId: number, bookingData: any) => {
    const response = await api.post(`/properties/${propertyId}/book`, bookingData);
    return response.data;
  },
  
  // Generate access key for a property
  generateAccessKey: async (propertyId: number, tenantData: any) => {
    const response = await api.post(`/properties/${propertyId}/access`, tenantData);
    return response.data;
  },
  
  // Complete a rental
  completeRental: async (propertyId: number) => {
    const response = await api.post(`/properties/${propertyId}/complete`);
    return response.data;
  },
  
  // Get digital keys for a user
  getDigitalKeys: async (walletAddress: string) => {
    const response = await api.get(`/properties/digital-keys/${walletAddress}`);
    return response.data;
  },
  
  // Get access keys for a tenant
  getAccessKeys: async (tenantId: string) => {
    const response = await api.get(`/properties/access-keys/${tenantId}`);
    return response.data;
  },
  
  // Access a property using a digital key
  accessProperty: async (lockId: string, walletAddress: string) => {
    const response = await api.post(`/properties/access/${lockId}`, { walletAddress });
    return response.data;
  },
  
  // Revoke access to a property
  revokeAccess: async (lockId: string, walletAddress: string) => {
    const response = await api.post(`/properties/revoke/${lockId}`, { walletAddress });
    return response.data;
  },
};

// API endpoints for smart locks
export const smartLockAPI = {
  // Get all smart locks
  getAllLocks: async () => {
    const response = await api.get('/locks');
    return response.data;
  },
  
  // Get a specific smart lock
  getLockById: async (lockId: string) => {
    const response = await api.get(`/locks/${lockId}`);
    return response.data;
  },
  
  // Register a new smart lock
  registerLock: async (lockData: any) => {
    const response = await api.post('/locks', lockData);
    return response.data;
  },
  
  // Grant access to a smart lock
  grantAccess: async (lockId: string, accessData: any) => {
    const response = await api.post(`/locks/${lockId}/access`, accessData);
    return response.data;
  },
  
  // Validate access to a smart lock
  validateAccess: async (lockId: string, accessToken: string) => {
    const response = await api.post(`/locks/${lockId}/validate`, { accessToken });
    return response.data;
  },
  
  // Unlock a door
  unlockDoor: async (lockId: string, accessToken: string) => {
    const response = await api.post(`/locks/${lockId}/unlock`, { accessToken });
    return response.data;
  },
  
  // Lock a door
  lockDoor: async (lockId: string, accessToken: string) => {
    const response = await api.post(`/locks/${lockId}/lock`, { accessToken });
    return response.data;
  },
  
  // Get access history for a lock
  getAccessHistory: async (lockId: string) => {
    const response = await api.get(`/locks/${lockId}/history`);
    return response.data;
  },
  
  // Analyze access patterns
  analyzeAccessPatterns: async (lockId: string) => {
    const response = await api.get(`/locks/${lockId}/analyze`);
    return response.data;
  },
  
  // Check for unauthorized access
  checkUnauthorizedAccess: async () => {
    const response = await api.post('/locks/check-unauthorized');
    return response.data;
  },
  
  // Start AI monitoring
  startMonitoring: async (interval?: number) => {
    const response = await api.post('/locks/monitoring/start', { interval });
    return response.data;
  },
  
  // Stop AI monitoring
  stopMonitoring: async () => {
    const response = await api.post('/locks/monitoring/stop');
    return response.data;
  },
};

// API endpoints for blockchain operations
export const blockchainAPI = {
  // Get blockchain status
  getStatus: async () => {
    const response = await api.get('/blockchain/status');
    return response.data;
  },
  
  // List a property on the blockchain
  listProperty: async (propertyData: any) => {
    const response = await api.post('/blockchain/properties/list', propertyData);
    return response.data;
  },
  
  // Book a property on the blockchain
  bookProperty: async (propertyId: number, bookingData: any) => {
    const response = await api.post(`/blockchain/properties/${propertyId}/book`, bookingData);
    return response.data;
  },
  
  // Generate a digital key on the blockchain
  generateDigitalKey: async (propertyId: number, tenantData: any) => {
    const response = await api.post(`/blockchain/properties/${propertyId}/key`, tenantData);
    return response.data;
  },
  
  // Validate access on the blockchain
  validateAccess: async (keyId: string, propertyId: number) => {
    const response = await api.post('/blockchain/access/validate', { keyId, propertyId });
    return response.data;
  },
  
  // Get transaction history
  getTransactionHistory: async (walletAddress: string) => {
    const response = await api.get(`/blockchain/transactions/${walletAddress}`);
    return response.data;
  },
  
  // Get property ownership history
  getPropertyHistory: async (propertyId: number) => {
    const response = await api.get(`/blockchain/properties/${propertyId}/history`);
    return response.data;
  },
};

export default api;