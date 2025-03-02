'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property/property-card';
import { SmartLockCard } from '@/components/digital-keys/smart-lock-card';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

interface Property {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  status: string;
}

interface SmartLock {
  id: string;
  propertyName: string;
  status: 'active' | 'inactive' | 'expired';
  validUntil: string;
  accessCode: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  timestamp: string;
  status: string;
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentals, setRentals] = useState<Property[]>([]);
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const router = useRouter();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchDashboardData();
    }
  }, [isConnected, publicKey]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [propertiesResponse, rentalsResponse, locksResponse, transactionsResponse] = await Promise.all([
        propertyAPI.getMyProperties(publicKey!),
        propertyAPI.getMyRentals(publicKey!),
        propertyAPI.getDigitalKeys(publicKey!),
        propertyAPI.getTransactions(publicKey!),
      ]);

      if (propertiesResponse.success && rentalsResponse.success && 
          locksResponse.success && transactionsResponse.success) {
        setProperties(propertiesResponse.data.properties);
        setRentals(rentalsResponse.data.rentals);
        setLocks(locksResponse.data.keys);
        setTransactions(transactionsResponse.data.transactions);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return properties.reduce((total, property) => total + property.price_per_day, 0);
  };

  const formatAmount = (amount: number) => {
    return `${(amount / 1000000000).toFixed(2)} SOL`;
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your dashboard
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600">
            Overview of your properties, rentals, and transactions
          </Text>
        </Box>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <>
            {/* Stats Overview */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Stat
                p={6}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
              >
                <StatLabel>Properties Listed</StatLabel>
                <StatNumber>{properties.length}</StatNumber>
                <StatHelpText>Total properties you own</StatHelpText>
              </Stat>

              <Stat
                p={6}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
              >
                <StatLabel>Active Rentals</StatLabel>
                <StatNumber>{rentals.length}</StatNumber>
                <StatHelpText>Properties you're renting</StatHelpText>
              </Stat>

              <Stat
                p={6}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
              >
                <StatLabel>Digital Keys</StatLabel>
                <StatNumber>{locks.length}</StatNumber>
                <StatHelpText>Active access keys</StatHelpText>
              </Stat>

              <Stat
                p={6}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
              >
                <StatLabel>Total Value</StatLabel>
                <StatNumber>{formatAmount(calculateTotalValue())}</StatNumber>
                <StatHelpText>Daily rental value</StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Properties Section */}
            {properties.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="lg">My Properties</Heading>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/my-properties')}
                  >
                    View All
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {properties.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Rentals Section */}
            {rentals.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="lg">My Rentals</Heading>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/my-rentals')}
                  >
                    View All
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {rentals.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Digital Keys Section */}
            {locks.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="lg">Digital Keys</Heading>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/digital-keys')}
                  >
                    View All
                  </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {locks.slice(0, 3).map((lock) => (
                    <SmartLockCard
                      key={lock.id}
                      lock={lock}
                      onAccess={(id) => {
                        toast({
                          title: 'Accessing property...',
                          description: 'Please check your wallet for confirmation.',
                          status: 'info',
                          duration: 5000,
                          isClosable: true,
                        });
                      }}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="lg">Recent Transactions</Heading>
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/transactions')}
                  >
                    View All
                  </Button>
                </HStack>
                <VStack spacing={4} align="stretch">
                  {transactions.slice(0, 5).map((tx) => (
                    <Box
                      key={tx.id}
                      p={4}
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      shadow="sm"
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme="blue">{tx.type}</Badge>
                          <Text fontWeight="bold">
                            {formatAmount(tx.amount)}
                          </Text>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          {new Date(tx.timestamp).toLocaleString()}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
}