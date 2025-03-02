// Export all mock data from a single file
import { mockPropertiesData } from './properties';
import { mockSmartLocksData } from './smartLocks';
import { mockTransactionsData } from './transactions';
import { mockAccessKeysData } from './accessKeys';

export const mockProperties = mockPropertiesData;
export const mockSmartLocks = mockSmartLocksData;
export const mockTransactions = mockTransactionsData;
export const mockAccessKeys = mockAccessKeysData;

export default {
  mockProperties,
  mockSmartLocks,
  mockTransactions,
  mockAccessKeys,
};
