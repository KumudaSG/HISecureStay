import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Badge,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useMode } from '../context/ModeContext';
import SmartLockCard from '../components/SmartLockCard';
import apiAdapter from '../services/apiAdapter';
import { PropertyData, SmartLockData, AccessKeyData } from '../services/apiAdapter';

// Mock data for digital keys - generated based on properties owned/rented
interface DigitalKey {
  id: string;
  propertyId: number;
  propertyName: string;
  lockId: string;
  accessToken: string;
  issuedAt: string;
  validUntil: string;
  status: 'active' | 'expired';
}

interface LockDetails {
  id: string;
  name: string;
  status: 'locked' | 'unlocked';
  battery: number;
  lastConnected: string;
  currentAccess: {
    accessToken: string;
    tenantPublicKey: string;
    grantedAt: string;
    validUntil: string;
  } | null;
}

const DigitalKeys: React.FC = () => {
  const [digitalKeys, setDigitalKeys] = useState<DigitalKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locks, setLocks] = useState<Record<string, LockDetails>>({});
  const { isConnected, publicKey, walletType } = useWallet();
  const { isDemoMode } = useMode();
  const navigate = useNavigate();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Fetch digital keys on component mount
  useEffect(() => {
    if (isConnected && publicKey) {
      fetchDigitalKeys();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, publicKey, isDemoMode]);
  
  // Fetch digital keys and associated locks
  const fetchDigitalKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all properties
      const allProperties = await apiAdapter.getAllProperties();
      
      // Get all locks
      const allLocks = await apiAdapter.getAllLocks();
      
      let userKeys: DigitalKey[] = [];
      let lockDetails: Record<string, LockDetails> = {};
      
      // Filter properties based on wallet type and generate keys
      if (walletType === 'owner') {
        // For owners - they have access to all locks for their properties
        const ownedProperties = allProperties.filter(p => p.owner === publicKey);
        
        userKeys = ownedProperties.map(property => {
          // Find the lock for this property
          const lock = allLocks.find(l => l.propertyId === property.id);
          if (!lock) return null;
          
          return {
            id: `key-owner-${property.id}`,
            propertyId: property.id,
            propertyName: property.title,
            lockId: lock.id,
            accessToken: `owner-token-${lock.id}`,
            issuedAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + 365 * 86400000).toISOString(), // 1 year from now
            status: 'active'
          };
        }).filter(Boolean) as DigitalKey[];
        
      } else if (walletType === 'tenant') {
        // For tenants - they have access to properties they're renting
        const rentedProperties = allProperties.filter(p => p.currentTenant === publicKey);
        
        userKeys = rentedProperties.map(property => {
          // Find the lock for this property
          const lock = allLocks.find(l => l.propertyId === property.id);
          if (!lock) return null;
          
          return {
            id: `key-tenant-${property.id}`,
            propertyId: property.id,
            propertyName: property.title,
            lockId: lock.id,
            accessToken: `tenant-token-${lock.id}`,
            issuedAt: property.rentalStart || new Date().toISOString(),
            validUntil: property.rentalEnd || new Date(Date.now() + 30 * 86400000).toISOString(),
            status: new Date(property.rentalEnd || '') > new Date() ? 'active' : 'expired'
          };
        }).filter(Boolean) as DigitalKey[];
      }
      
      // Create lock details map
      allLocks.forEach(lock => {
        // Only include locks that the user has keys for
        const userHasKey = userKeys.some(key => key.lockId === lock.id);
        if (userHasKey) {
          lockDetails[lock.id] = {
            id: lock.id,
            name: `${allProperties.find(p => p.id === lock.propertyId)?.title || 'Property'} Lock`,
            status: lock.isLocked ? 'locked' : 'unlocked',
            battery: lock.batteryLevel,
            lastConnected: new Date().toISOString(),
            currentAccess: {
              accessToken: userKeys.find(key => key.lockId === lock.id)?.accessToken || '',
              tenantPublicKey: publicKey || '',
              grantedAt: new Date().toISOString(),
              validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
            }
          };
        }
      });
      
      setDigitalKeys(userKeys);
      setLocks(lockDetails);
    } catch (error) {
      console.error('Error fetching digital keys:', error);
      setError('Failed to load your digital keys. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  // Check if a key is active
  const isKeyActive = (validUntil: string) => {
    return new Date(validUntil) > new Date();
  };
  
  // Handle refresh locks
  const handleRefreshLocks = async () => {
    toast({
      title: 'Refreshing locks...',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
    
    await fetchDigitalKeys();
  };
  
  if (!isConnected) {
    return (
      <Container maxW="1200px" py={10}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Please connect your wallet to view your digital keys
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box as="main" py={8} px={4}>
      <Container maxW="1200px">
        {/* Header */}
        <VStack spacing={4} mb={10} align="start">
          <Heading as="h1" size="xl">
            Your Digital Keys
          </Heading>
          <Text color="gray.600">
            View and manage your blockchain-secured digital keys for properties
          </Text>
          <HStack>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleRefreshLocks}
            >
              Refresh Locks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/properties')}
            >
              Browse Properties
            </Button>
          </HStack>
        </VStack>
        
        {error ? (
          <Alert status="error" borderRadius="md" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        ) : digitalKeys.length === 0 ? (
          <Box
            p={8}
            borderRadius="lg"
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            textAlign="center"
          >
            <VStack spacing={4}>
              <Text fontSize="lg">You don't have any digital keys yet</Text>
              <Button 
                colorScheme="blue" 
                onClick={() => navigate('/properties')}
              >
                Browse Properties
              </Button>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={8} align="stretch">
            {/* Active Keys */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                Active Keys
              </Heading>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={6}
              >
                {digitalKeys
                  .filter(key => isKeyActive(key.validUntil))
                  .map(key => (
                    <Box
                      key={key.id}
                      p={5}
                      borderWidth="1px"
                      borderRadius="lg"
                      bg={cardBg}
                      borderColor="green.200"
                      boxShadow="md"
                    >
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="100%">
                          <Heading size="md">{key.propertyName}</Heading>
                          <Badge colorScheme="green">Active</Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.500">
                          Valid until: {formatDate(key.validUntil)}
                        </Text>
                        
                        <Divider />
                        
                        <SmartLockCard
                          lock={locks[key.lockId]}
                          accessToken={key.accessToken}
                          onStatusChange={handleRefreshLocks}
                        />
                      </VStack>
                    </Box>
                  ))}
                  
                {digitalKeys.filter(key => isKeyActive(key.validUntil)).length === 0 && (
                  <Text color="gray.500">No active keys</Text>
                )}
              </Grid>
            </Box>
            
            {/* Expired Keys */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                Expired Keys
              </Heading>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={6}
              >
                {digitalKeys
                  .filter(key => !isKeyActive(key.validUntil))
                  .map(key => (
                    <Box
                      key={key.id}
                      p={5}
                      borderWidth="1px"
                      borderRadius="lg"
                      bg={cardBg}
                      borderColor={borderColor}
                      opacity={0.7}
                    >
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="100%">
                          <Heading size="md">{key.propertyName}</Heading>
                          <Badge colorScheme="gray">Expired</Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.500">
                          Expired on: {formatDate(key.validUntil)}
                        </Text>
                        
                        <Button 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => navigate(`/properties/${key.propertyId}`)}
                        >
                          View Property
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                  
                {digitalKeys.filter(key => !isKeyActive(key.validUntil)).length === 0 && (
                  <Text color="gray.500">No expired keys</Text>
                )}
              </Grid>
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default DigitalKeys;