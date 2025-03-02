import api, { propertyAPI, smartLockAPI, blockchainAPI } from './api';
import { mockPropertiesData } from './mockData/properties';
import { mockSmartLocksData } from './mockData/smartLocks';
import { mockTransactionsData } from './mockData/transactions';
import { mockAccessKeysData } from './mockData/accessKeys';

// Type definitions for the adapter
export interface PropertyData {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  owner: string;
  amenities: string[];
  availability: boolean;
  smartLockId?: string;
  currentTenant?: string;
  rentalStart?: string;
  rentalEnd?: string;
}

export interface SmartLockData {
  id: string;
  propertyId: number;
  isLocked: boolean;
  accessHistory: {
    timestamp: string;
    user: string;
    action: 'lock' | 'unlock';
    authorized: boolean;
  }[];
  authorizedUsers: string[];
  batteryLevel: number;
  status: 'online' | 'offline';
}

export interface TransactionData {
  id: string;
  type: 'booking' | 'payment' | 'refund' | 'deposit';
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  propertyId: number;
  description: string;
}

export interface AccessKeyData {
  id: string;
  propertyId: number;
  propertyTitle: string;
  tenantId: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  lastUsed?: string;
}

// Main API adapter class
class ApiAdapter {
  isDemoMode: boolean;

  constructor(isDemoMode = true) { 
    this.isDemoMode = isDemoMode;
  }

  setMode(isDemoMode: boolean) {
    this.isDemoMode = isDemoMode;
    console.log(`API Adapter mode set to ${isDemoMode ? 'demo' : 'real'}`);
  }

  // Properties API

  async getAllProperties(): Promise<PropertyData[]> {
    if (this.isDemoMode) {
      return mockPropertiesData;
    } else {
      try {
        const response = await propertyAPI.getAllProperties();
        return response.data;
      } catch (error) {
        console.error('Error fetching properties:', error);
        console.warn('Falling back to mock data');
        return mockPropertiesData;
      }
    }
  }

  async getPropertyById(id: number): Promise<PropertyData> {
    if (this.isDemoMode) {
      const property = mockPropertiesData.find(p => p.id === id);
      if (!property) {
        throw new Error(`Property with ID ${id} not found`);
      }
      return property;
    } else {
      try {
        const response = await propertyAPI.getPropertyById(id);
        return response.data;
      } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        const property = mockPropertiesData.find(p => p.id === id);
        if (!property) {
          throw new Error(`Property with ID ${id} not found`);
        }
        console.warn('Falling back to mock data');
        return property;
      }
    }
  }

  async createProperty(propertyData: Partial<PropertyData>): Promise<PropertyData> {
    if (this.isDemoMode) {
      const newId = Math.max(...mockPropertiesData.map(p => p.id)) + 1;
      const newProperty = {
        id: newId,
        title: propertyData.title || 'New Property',
        description: propertyData.description || 'No description provided',
        location: propertyData.location || 'Unknown location',
        price: propertyData.price || 0,
        images: propertyData.images || [],
        owner: propertyData.owner || 'unknown',
        amenities: propertyData.amenities || [],
        availability: propertyData.availability !== undefined ? propertyData.availability : true,
      } as PropertyData;
      
      mockPropertiesData.push(newProperty);
      return newProperty;
    } else {
      try {
        const response = await propertyAPI.createProperty(propertyData);
        return response.data;
      } catch (error) {
        console.error('Error creating property:', error);
        console.warn('Falling back to mock implementation');
        
        const newId = Math.max(...mockPropertiesData.map(p => p.id)) + 1;
        const newProperty = {
          id: newId,
          title: propertyData.title || 'New Property',
          description: propertyData.description || 'No description provided',
          location: propertyData.location || 'Unknown location',
          price: propertyData.price || 0,
          images: propertyData.images || [],
          owner: propertyData.owner || 'unknown',
          amenities: propertyData.amenities || [],
          availability: propertyData.availability !== undefined ? propertyData.availability : true,
        } as PropertyData;
        
        mockPropertiesData.push(newProperty);
        return newProperty;
      }
    }
  }

  async bookProperty(propertyId: number, bookingData: any): Promise<any> {
    if (this.isDemoMode) {
      const propertyIndex = mockPropertiesData.findIndex(p => p.id === propertyId);
      if (propertyIndex === -1) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }
      
      mockPropertiesData[propertyIndex] = {
        ...mockPropertiesData[propertyIndex],
        availability: false,
        currentTenant: bookingData.tenant,
        rentalStart: bookingData.startDate,
        rentalEnd: bookingData.endDate
      };
      
      const newTransaction: TransactionData = {
        id: `tx-${Date.now()}`,
        type: 'booking' as 'booking', 
        amount: mockPropertiesData[propertyIndex].price,
        from: bookingData.tenant,
        to: mockPropertiesData[propertyIndex].owner,
        timestamp: new Date().toISOString(),
        status: 'completed' as 'completed', 
        propertyId: propertyId,
        description: `Booking for ${mockPropertiesData[propertyIndex].title}`
      };
      
      mockTransactionsData.push(newTransaction);
      
      return {
        success: true,
        property: mockPropertiesData[propertyIndex],
        transaction: newTransaction
      };
    } else {
      try {
        const response = await propertyAPI.bookProperty(propertyId, bookingData);
        return response.data;
      } catch (error) {
        console.error(`Error booking property ${propertyId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const propertyIndex = mockPropertiesData.findIndex(p => p.id === propertyId);
        if (propertyIndex === -1) {
          throw new Error(`Property with ID ${propertyId} not found`);
        }
        
        mockPropertiesData[propertyIndex] = {
          ...mockPropertiesData[propertyIndex],
          availability: false,
          currentTenant: bookingData.tenant,
          rentalStart: bookingData.startDate,
          rentalEnd: bookingData.endDate
        };
        
        const newTransaction: TransactionData = {
          id: `tx-${Date.now()}`,
          type: 'booking' as 'booking',
          amount: mockPropertiesData[propertyIndex].price,
          from: bookingData.tenant,
          to: mockPropertiesData[propertyIndex].owner,
          timestamp: new Date().toISOString(),
          status: 'completed' as 'completed',
          propertyId: propertyId,
          description: `Booking for ${mockPropertiesData[propertyIndex].title}`
        };
        
        mockTransactionsData.push(newTransaction);
        
        return {
          success: true,
          property: mockPropertiesData[propertyIndex],
          transaction: newTransaction
        };
      }
    }
  }

  async generateAccessKey(propertyId: number, tenantData: any): Promise<AccessKeyData> {
    if (this.isDemoMode) {
      const property = mockPropertiesData.find(p => p.id === propertyId);
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }
      
      const accessKey: AccessKeyData = {
        id: `key-${Date.now()}`,
        propertyId: propertyId,
        propertyTitle: property.title,
        tenantId: tenantData.tenant,
        validFrom: tenantData.startDate || new Date().toISOString(),
        validTo: tenantData.endDate || new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        isActive: true
      };
      
      return accessKey;
    } else {
      try {
        const response = await propertyAPI.generateAccessKey(propertyId, tenantData);
        return response.data;
      } catch (error) {
        console.error(`Error generating access key for property ${propertyId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const property = mockPropertiesData.find(p => p.id === propertyId);
        if (!property) {
          throw new Error(`Property with ID ${propertyId} not found`);
        }
        
        const accessKey: AccessKeyData = {
          id: `key-${Date.now()}`,
          propertyId: propertyId,
          propertyTitle: property.title,
          tenantId: tenantData.tenant,
          validFrom: tenantData.startDate || new Date().toISOString(),
          validTo: tenantData.endDate || new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          isActive: true
        };
        
        return accessKey;
      }
    }
  }

  async getAllLocks(): Promise<SmartLockData[]> {
    if (this.isDemoMode) {
      return mockSmartLocksData;
    } else {
      try {
        const response = await smartLockAPI.getAllLocks();
        return response.data;
      } catch (error) {
        console.error('Error fetching locks:', error);
        console.warn('Falling back to mock data');
        return mockSmartLocksData;
      }
    }
  }

  async getLockById(lockId: string): Promise<SmartLockData> {
    if (this.isDemoMode) {
      const lock = mockSmartLocksData.find(l => l.id === lockId);
      if (!lock) {
        throw new Error(`Smart lock with ID ${lockId} not found`);
      }
      return lock;
    } else {
      try {
        const response = await smartLockAPI.getLockById(lockId);
        return response.data;
      } catch (error) {
        console.error(`Error fetching lock ${lockId}:`, error);
        const lock = mockSmartLocksData.find(l => l.id === lockId);
        if (!lock) {
          throw new Error(`Smart lock with ID ${lockId} not found`);
        }
        console.warn('Falling back to mock data');
        return lock;
      }
    }
  }

  async unlockDoor(lockId: string, accessToken: string): Promise<boolean> {
    if (this.isDemoMode) {
      const lockIndex = mockSmartLocksData.findIndex(l => l.id === lockId);
      if (lockIndex === -1) {
        throw new Error(`Smart lock with ID ${lockId} not found`);
      }
      
      const newAccessRecord = {
        timestamp: new Date().toISOString(),
        user: 'current-user', 
        action: 'unlock' as const,
        authorized: true
      };
      
      mockSmartLocksData[lockIndex].accessHistory.push(newAccessRecord);
      mockSmartLocksData[lockIndex].isLocked = false;
      
      return true;
    } else {
      try {
        const response = await smartLockAPI.unlockDoor(lockId, accessToken);
        return response.data.success;
      } catch (error) {
        console.error(`Error unlocking door ${lockId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const lockIndex = mockSmartLocksData.findIndex(l => l.id === lockId);
        if (lockIndex === -1) {
          throw new Error(`Smart lock with ID ${lockId} not found`);
        }
        
        const newAccessRecord = {
          timestamp: new Date().toISOString(),
          user: 'current-user', 
          action: 'unlock' as const,
          authorized: true
        };
        
        mockSmartLocksData[lockIndex].accessHistory.push(newAccessRecord);
        mockSmartLocksData[lockIndex].isLocked = false;
        
        return true;
      }
    }
  }

  async lockDoor(lockId: string, accessToken: string): Promise<boolean> {
    if (this.isDemoMode) {
      const lockIndex = mockSmartLocksData.findIndex(l => l.id === lockId);
      if (lockIndex === -1) {
        throw new Error(`Smart lock with ID ${lockId} not found`);
      }
      
      const newAccessRecord = {
        timestamp: new Date().toISOString(),
        user: 'current-user', 
        action: 'lock' as const,
        authorized: true
      };
      
      mockSmartLocksData[lockIndex].accessHistory.push(newAccessRecord);
      mockSmartLocksData[lockIndex].isLocked = true;
      
      return true;
    } else {
      try {
        const response = await smartLockAPI.lockDoor(lockId, accessToken);
        return response.data.success;
      } catch (error) {
        console.error(`Error locking door ${lockId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const lockIndex = mockSmartLocksData.findIndex(l => l.id === lockId);
        if (lockIndex === -1) {
          throw new Error(`Smart lock with ID ${lockId} not found`);
        }
        
        const newAccessRecord = {
          timestamp: new Date().toISOString(),
          user: 'current-user', 
          action: 'lock' as const,
          authorized: true
        };
        
        mockSmartLocksData[lockIndex].accessHistory.push(newAccessRecord);
        mockSmartLocksData[lockIndex].isLocked = true;
        
        return true;
      }
    }
  }

  async getAccessHistory(lockId: string): Promise<any[]> {
    if (this.isDemoMode) {
      const lock = mockSmartLocksData.find(l => l.id === lockId);
      if (!lock) {
        throw new Error(`Smart lock with ID ${lockId} not found`);
      }
      
      return lock.accessHistory;
    } else {
      try {
        const response = await smartLockAPI.getAccessHistory(lockId);
        return response.data;
      } catch (error) {
        console.error(`Error fetching access history for lock ${lockId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const lock = mockSmartLocksData.find(l => l.id === lockId);
        if (!lock) {
          throw new Error(`Smart lock with ID ${lockId} not found`);
        }
        
        return lock.accessHistory;
      }
    }
  }

  async getTransactions(): Promise<TransactionData[]> {
    if (this.isDemoMode) {
      return mockTransactionsData;
    } else {
      try {
        const response = await api.get('/transactions');
        return response.data;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        console.warn('Falling back to mock data');
        return mockTransactionsData;
      }
    }
  }

  async getTransactionsByUser(userId: string): Promise<TransactionData[]> {
    if (this.isDemoMode) {
      return mockTransactionsData.filter(
        tx => tx.from === userId || tx.to === userId
      );
    } else {
      try {
        const response = await api.get(`/transactions/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching transactions for user ${userId}:`, error);
        console.warn('Falling back to mock implementation');
        
        return mockTransactionsData.filter(
          tx => tx.from === userId || tx.to === userId
        );
      }
    }
  }

  async generateDigitalKey(propertyId: number, tenantData: any): Promise<AccessKeyData> {
    if (this.isDemoMode) {
      const property = mockPropertiesData.find(p => p.id === propertyId);
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }
      
      const accessKey: AccessKeyData = {
        id: `key-${Date.now()}`,
        propertyId: propertyId,
        propertyTitle: property.title,
        tenantId: tenantData.tenant,
        validFrom: tenantData.startDate || new Date().toISOString(),
        validTo: tenantData.endDate || new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        isActive: true
      };
      
      return accessKey;
    } else {
      try {
        const response = await propertyAPI.generateAccessKey(propertyId, tenantData);
        return response.data;
      } catch (error) {
        console.error(`Error generating digital key for property ${propertyId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const property = mockPropertiesData.find(p => p.id === propertyId);
        if (!property) {
          throw new Error(`Property with ID ${propertyId} not found`);
        }
        
        const accessKey: AccessKeyData = {
          id: `key-${Date.now()}`,
          propertyId: propertyId,
          propertyTitle: property.title,
          tenantId: tenantData.tenant,
          validFrom: tenantData.startDate || new Date().toISOString(),
          validTo: tenantData.endDate || new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          isActive: true
        };
        
        return accessKey;
      }
    }
  }

  async getAccessKeys(tenantId: string): Promise<AccessKeyData[]> {
    if (this.isDemoMode) {
      return mockAccessKeysData.filter(key => key.tenantId === tenantId);
    } else {
      try {
        const response = await propertyAPI.getAccessKeys(tenantId);
        return response.data;
      } catch (error) {
        console.error(`Error fetching access keys for tenant ${tenantId}:`, error);
        console.warn('Falling back to mock implementation');
        
        return mockAccessKeysData.filter(key => key.tenantId === tenantId);
      }
    }
  }

  async validateAccess(keyId: string, propertyId: number): Promise<any> {
    if (this.isDemoMode) {
      const key = mockAccessKeysData.find(k => k.id === keyId);
      
      if (!key) {
        throw new Error(`Key with ID ${keyId} not found`);
      }
      
      // Check if the key is valid
      const now = new Date();
      const validFrom = new Date(key.validFrom);
      const validTo = new Date(key.validTo);
      const isValid = key.isActive && now >= validFrom && now <= validTo;
      
      if (!isValid) {
        throw new Error('Access denied: Key is not valid');
      }
      
      // Update the last used timestamp
      key.lastUsed = now.toISOString();
      
      return {
        success: true,
        message: 'Access granted',
        accessGranted: true,
      };
    } else {
      try {
        const response = await smartLockAPI.validateAccess(keyId, 'mock-token');
        return response.data;
      } catch (error) {
        console.error(`Error validating access for key ${keyId}:`, error);
        console.warn('Falling back to mock implementation');
        
        const key = mockAccessKeysData.find(k => k.id === keyId);
        
        if (!key) {
          throw new Error(`Key with ID ${keyId} not found`);
        }
        
        // Check if the key is valid
        const now = new Date();
        const validFrom = new Date(key.validFrom);
        const validTo = new Date(key.validTo);
        const isValid = key.isActive && now >= validFrom && now <= validTo;
        
        if (!isValid) {
          throw new Error('Access denied: Key is not valid');
        }
        
        // Update the last used timestamp
        key.lastUsed = now.toISOString();
        
        return {
          success: true,
          message: 'Access granted',
          accessGranted: true,
        };
      }
    }
  }
}

const apiAdapter = new ApiAdapter(true); 
export default apiAdapter;