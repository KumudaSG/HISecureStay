// Central type definitions for the HISecureStay application

// Property related types
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

export interface PropertyResponse {
  success: boolean;
  data: {
    properties: PropertyDisplayData[];
  };
}

export interface PropertyDisplayData {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  location: {
    city: string;
    state: string;
    address?: string;
  };
  images: string[];
  status: 'available' | 'booked' | 'rented';
  rental_start?: string;
  rental_end?: string;
  min_duration?: number;
  max_duration?: number;
  smart_lock_id?: string;
  is_available?: boolean;
  owner?: string;
  amenities?: string[];
}

// Smart Lock related types
export interface SmartLockData {
  id: string;
  propertyId: number;
  isLocked: boolean;
  accessHistory: AccessHistoryItem[];
  authorizedUsers: string[];
  batteryLevel: number;
  status: 'online' | 'offline';
}

export interface AccessHistoryItem {
  timestamp: string;
  user: string;
  action: 'lock' | 'unlock';
  authorized: boolean;
}

// Digital Key related types
export interface DigitalKeyData {
  id: string;
  propertyName: string;
  status: 'active' | 'inactive' | 'expired';
  validUntil: string;
  accessCode: string;
}

export interface DigitalKeyResponse {
  success: boolean;
  data: {
    keys: DigitalKeyData[];
  };
}

export interface AccessKeyData {
  id: string;
  propertyId: number;
  propertyTitle: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  lastUsed?: string;
}

// Transaction related types
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface RentalResponse {
  success: boolean;
  data: {
    rentals: PropertyDisplayData[];
  };
}

// Access related types
export interface AccessResponse {
  success: boolean;
  message: string;
}
