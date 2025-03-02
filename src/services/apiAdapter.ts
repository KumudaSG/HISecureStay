import api, { propertyAPI, smartLockAPI, blockchainAPI } from './api';
import { mockPropertiesData } from './mockData/properties';
import { mockSmartLocksData } from './mockData/smartLocks';
import { mockTransactionsData } from './mockData/transactions';
import { mockAccessKeysData } from './mockData/accessKeys';

// Type definitions for the adapter
export interface PropertyData {
  id: number | string;
  title?: string;
  name?: string;
  description: string;
  location: string | {
    address: string;
    city: string;
    state: string;
  };
  price?: number;
  price_per_day?: number;
  min_duration?: number;
  max_duration?: number;
  images: string[];
  owner: string;
  amenities: string[];
  availability?: boolean;
  is_available?: boolean;
  smartLockId?: string;
  smart_lock_id?: string;
  currentTenant?: string;
  rentalStart?: string;
  rentalEnd?: string;
  created_at?: string;
}

export interface RentalData {
  id: string;
  property_id: number | string;
  property_name: string;
  tenant: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming';
  amount_paid: number;
  security_deposit: number;
  property: PropertyData;
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
      // Try to fetch properties from localStorage first for persistence
      try {
        const storedProperties = localStorage.getItem('mockProperties');
        if (storedProperties) {
          const parsedProperties = JSON.parse(storedProperties);
          // If we have stored properties, combine them with the mock data
          // but avoid duplicates by checking IDs
          const existingIds = new Set(mockPropertiesData.map(p => p.id));
          const newPropertiesToAdd = parsedProperties.filter(p => !existingIds.has(p.id));
          
          // Add new properties to the mock data array
          if (newPropertiesToAdd.length > 0) {
            mockPropertiesData.push(...newPropertiesToAdd);
          }
        }
      } catch (err) {
        console.warn('Could not load properties from localStorage:', err);
      }
      
      // Sort properties by creation date (newest first)
      return [...mockPropertiesData].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    } else {
      try {
        const response = await propertyAPI.getAllProperties();
        return response.data;
      } catch (error) {
        console.error('Error fetching properties:', error);
        console.warn('Falling back to mock data');
        
        // Try to get data from localStorage as a fallback
        try {
          const storedProperties = localStorage.getItem('mockProperties');
          if (storedProperties) {
            const parsedProperties = JSON.parse(storedProperties);
            return [...mockPropertiesData, ...parsedProperties].sort((a, b) => {
              if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              }
              return 0;
            });
          }
        } catch (err) {
          console.warn('Could not load properties from localStorage:', err);
        }
        
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
      const newId = Math.max(...mockPropertiesData.map(p => typeof p.id === 'number' ? p.id : 0)) + 1;
      
      // Create a property with consistent data format that works with both API structures
      const newProperty = {
        id: newId,
        // Support both formats - name and title
        name: propertyData.name || propertyData.title || 'New Property',
        title: propertyData.title || propertyData.name || 'New Property',
        description: propertyData.description || 'No description provided',
        
        // Properly handle location formats (string or object)
        location: typeof propertyData.location === 'string' 
          ? propertyData.location 
          : propertyData.location || 'Unknown location',
          
        // Support address format if provided as an object
        ...(typeof propertyData.location === 'object' && {
          location: {
            address: propertyData.location.address || '',
            city: propertyData.location.city || '',
            state: propertyData.location.state || '',
          }
        }),
        
        // Support both price formats
        price: propertyData.price || 0,
        price_per_day: propertyData.price_per_day || propertyData.price || 0,
        
        // Duration fields
        min_duration: propertyData.min_duration || 1,
        max_duration: propertyData.max_duration || 30,
        
        // Support image arrays
        images: propertyData.images || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
        
        // Owner information
        owner: propertyData.owner || 'unknown',
        
        // Amenities array
        amenities: propertyData.amenities || [],
        
        // Support both availability formats
        availability: propertyData.availability !== undefined ? propertyData.availability : true,
        is_available: propertyData.is_available !== undefined ? propertyData.is_available : 
                     (propertyData.availability !== undefined ? propertyData.availability : true),
        
        // Support both smart lock ID formats
        smartLockId: propertyData.smartLockId || `lock-${newId}`,
        smart_lock_id: propertyData.smart_lock_id || propertyData.smartLockId || `lock-${newId}`,
        
        // Add a timestamp for sorting
        created_at: new Date().toISOString(),
      } as PropertyData;
      
      // Store in mock data array
      mockPropertiesData.push(newProperty);
      
      // Save to localStorage for persistence
      try {
        // Get existing data or initialize empty array
        const storedProperties = localStorage.getItem('mockProperties');
        const parsedProperties = storedProperties ? JSON.parse(storedProperties) : [];
        
        // Add new property and save back to localStorage
        parsedProperties.push(newProperty);
        localStorage.setItem('mockProperties', JSON.stringify(parsedProperties));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      
      return newProperty;
    } else {
      try {
        const response = await propertyAPI.createProperty(propertyData);
        return response.data;
      } catch (error) {
        console.error('Error creating property:', error);
        console.warn('Falling back to mock implementation');
        
        // Use the same creation logic as above for consistency
        const newId = Math.max(...mockPropertiesData.map(p => typeof p.id === 'number' ? p.id : 0)) + 1;
        
        const newProperty = {
          id: newId,
          name: propertyData.name || propertyData.title || 'New Property',
          title: propertyData.title || propertyData.name || 'New Property',
          description: propertyData.description || 'No description provided',
          location: typeof propertyData.location === 'string' 
            ? propertyData.location 
            : propertyData.location || 'Unknown location',
          ...(typeof propertyData.location === 'object' && {
            location: {
              address: propertyData.location.address || '',
              city: propertyData.location.city || '',
              state: propertyData.location.state || '',
            }
          }),
          price: propertyData.price || 0,
          price_per_day: propertyData.price_per_day || propertyData.price || 0,
          min_duration: propertyData.min_duration || 1,
          max_duration: propertyData.max_duration || 30,
          images: propertyData.images || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
          owner: propertyData.owner || 'unknown',
          amenities: propertyData.amenities || [],
          availability: propertyData.availability !== undefined ? propertyData.availability : true,
          is_available: propertyData.is_available !== undefined ? propertyData.is_available : 
                      (propertyData.availability !== undefined ? propertyData.availability : true),
          smartLockId: propertyData.smartLockId || `lock-${newId}`,
          smart_lock_id: propertyData.smart_lock_id || propertyData.smartLockId || `lock-${newId}`,
          created_at: new Date().toISOString(),
        } as PropertyData;
        
        mockPropertiesData.push(newProperty);
        
        // Also save to localStorage
        try {
          const storedProperties = localStorage.getItem('mockProperties');
          const parsedProperties = storedProperties ? JSON.parse(storedProperties) : [];
          parsedProperties.push(newProperty);
          localStorage.setItem('mockProperties', JSON.stringify(parsedProperties));
        } catch (err) {
          console.warn('Could not save to localStorage:', err);
        }
        
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
  
  async getDigitalKeys(walletAddress: string): Promise<any[]> {
    if (this.isDemoMode) {
      // Generate a few sample digital keys based on the properties
      const mockDigitalKeys = mockPropertiesData.slice(0, 3).map((property, index) => {
        // Create staggered key expiration dates
        const today = new Date();
        let expiryDate = new Date();
        
        if (index === 0) {
          // First key expires in 7 days
          expiryDate.setDate(today.getDate() + 7);
        } else if (index === 1) {
          // Second key expires in 30 days
          expiryDate.setDate(today.getDate() + 30);
        } else {
          // Other keys are set to have already expired
          expiryDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        }
        
        return {
          id: `key-${property.id}`,
          propertyName: property.name || property.title || `Property ${property.id}`,
          propertyId: property.id,
          status: index < 2 ? 'active' : 'expired',
          validUntil: expiryDate.toISOString(),
          accessCode: `ACCESS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        };
      });
      
      return mockDigitalKeys;
    } else {
      try {
        const response = await propertyAPI.getDigitalKeys(walletAddress);
        return response.data.keys || [];
      } catch (error) {
        console.error(`Error fetching digital keys for user ${walletAddress}:`, error);
        console.warn('Falling back to mock implementation');
        
        // Generate sample keys as fallback
        const mockDigitalKeys = mockPropertiesData.slice(0, 3).map((property, index) => {
          const today = new Date();
          let expiryDate = new Date();
          
          if (index === 0) {
            expiryDate.setDate(today.getDate() + 7);
          } else if (index === 1) {
            expiryDate.setDate(today.getDate() + 30);
          } else {
            expiryDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
          }
          
          return {
            id: `key-${property.id}`,
            propertyName: property.name || property.title || `Property ${property.id}`,
            propertyId: property.id,
            status: index < 2 ? 'active' : 'expired',
            validUntil: expiryDate.toISOString(),
            accessCode: `ACCESS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          };
        });
        
        return mockDigitalKeys;
      }
    }
  }
  
  async getMyRentals(walletAddress: string): Promise<PropertyData[]> {
    if (this.isDemoMode) {
      // Create simplified sample rental properties for demo purposes
      const demoRentals = mockPropertiesData.slice(0, 3).map((p) => {
        return {
          ...p,
          id: `rental-${p.id}`,
          currentTenant: walletAddress,
          is_available: false,
          availability: false
        } as PropertyData;
      });
      
      return demoRentals;
    } else {
      try {
        const response = await propertyAPI.getMyRentals(walletAddress);
        return response.data.rentals || [];
      } catch (error) {
        console.error(`Error fetching rentals for user ${walletAddress}:`, error);
        console.warn('Falling back to mock implementation');
        
        // Create simplified sample rental properties as a fallback
        const demoRentals = mockPropertiesData.slice(0, 3).map((p) => {
          return {
            ...p,
            id: `rental-${p.id}`,
            currentTenant: walletAddress,
            is_available: false,
            availability: false
          } as PropertyData;
        });
        
        return demoRentals;
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