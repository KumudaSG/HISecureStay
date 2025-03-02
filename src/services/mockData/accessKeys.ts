import { AccessKeyData } from '../apiAdapter';

// Mock data for access keys
export const mockAccessKeysData: AccessKeyData[] = [
  {
    id: 'key-001',
    propertyId: 1,
    propertyTitle: 'Luxury Apartment in Downtown',
    tenantId: '8xF3...j9Kl', // This would be a wallet address in production
    validFrom: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    validTo: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    isActive: true,
    lastUsed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'key-002',
    propertyId: 2,
    propertyTitle: 'Beachfront Villa',
    tenantId: '8xF3...j9Kl', // This would be a wallet address in production
    validFrom: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    validTo: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    isActive: true,
    lastUsed: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 'key-003',
    propertyId: 3,
    propertyTitle: 'Mountain Cabin',
    tenantId: '8xF3...j9Kl', // This would be a wallet address in production
    validFrom: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    validTo: new Date(Date.now() - 86400000).toISOString(), // 1 day ago (expired)
    isActive: true,
    lastUsed: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'key-004',
    propertyId: 4,
    propertyTitle: 'Urban Loft',
    tenantId: '8xF3...j9Kl', // This would be a wallet address in production
    validFrom: new Date(Date.now() + 86400000).toISOString(), // 1 day from now (not yet valid)
    validTo: new Date(Date.now() + 691200000).toISOString(), // 8 days from now
    isActive: true,
  },
  {
    id: 'key-005',
    propertyId: 5,
    propertyTitle: 'Countryside Cottage',
    tenantId: '8xF3...j9Kl', // This would be a wallet address in production
    validFrom: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    validTo: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    isActive: false, // Deactivated key
    lastUsed: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
  // Different tenant
  {
    id: 'key-006',
    propertyId: 6,
    propertyTitle: 'Penthouse Suite',
    tenantId: 'Abc1...Z2y3', // Different tenant
    validFrom: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    validTo: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    isActive: true,
    lastUsed: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
];

export default mockAccessKeysData;
