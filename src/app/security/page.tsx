'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SmartLockCard } from '@/components/digital-keys/smart-lock-card';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

interface SecurityEvent {
  id: string;
  type: 'access' | 'revoke' | 'alert';
  propertyName: string;
  timestamp: string;
  description: string;
  status: 'success' | 'warning' | 'error';
}

interface SmartLock {
  id: string;
  propertyName: string;
  status: 'active' | 'inactive' | 'expired';
  validUntil: string;
  accessCode: string;
}

export default function Security() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchSecurityData();
    }
  }, [isConnected, publicKey]);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsResponse, locksResponse] = await Promise.all([
        propertyAPI.getSecurityEvents(publicKey!),
        propertyAPI.getDigitalKeys(publicKey!),
      ]);

      if (eventsResponse.success && locksResponse.success) {
        setEvents(eventsResponse.data.events);
        setLocks(locksResponse.data.keys);
      } else {
        setError('Failed to load security data');
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Failed to load security data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccess = async (lockId: string) => {
    try {
      const response = await propertyAPI.accessProperty(lockId, publicKey!);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property access granted',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchSecurityData(); // Refresh data
      } else {
        throw new Error('Failed to access property');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access property. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRevoke = async (lockId: string) => {
    try {
      const response = await propertyAPI.revokeAccess(lockId, publicKey!);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Access revoked successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchSecurityData(); // Refresh data
      } else {
        throw new Error('Failed to revoke access');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke access. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view security information
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Security Center
          </Heading>
          <Text color="gray.600">
            Monitor and manage security for your properties
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
            <Box>
              <Heading size="lg" mb={4}>Active Digital Keys</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {locks.map((lock) => (
                  <SmartLockCard
                    key={lock.id}
                    lock={lock}
                    onAccess={handleAccess}
                    onRevoke={handleRevoke}
                  />
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="lg" mb={4}>Recent Security Events</Heading>
              <VStack spacing={4} align="stretch">
                {events.map((event) => (
                  <Box
                    key={event.id}
                    p={4}
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontWeight="bold">{event.propertyName}</Text>
                          <Badge
                            colorScheme={
                              event.status === 'success'
                                ? 'green'
                                : event.status === 'warning'
                                ? 'yellow'
                                : 'red'
                            }
                          >
                            {event.type}
                          </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          {new Date(event.timestamp).toLocaleString()}
                        </Text>
                      </VStack>
                      <Text>{event.description}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
}