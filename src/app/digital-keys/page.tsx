'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SmartLockCard } from '@/components/digital-keys/smart-lock-card';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';
import { DigitalKeyData, AccessResponse } from '@/types';

export default function DigitalKeys() {
  const [locks, setLocks] = useState<DigitalKeyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const toast = useToast();

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchDigitalKeys();
    }
  }, [isConnected, publicKey]);

  const fetchDigitalKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyAPI.getDigitalKeys(publicKey!);
      if (response.success && response.data.keys) {
        setLocks(response.data.keys);
      } else {
        setError('Failed to load digital keys');
      }
    } catch (error) {
      console.error('Error fetching digital keys:', error);
      setError('Failed to load digital keys. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccess = async (lockId: string) => {
    try {
      const response = await propertyAPI.accessProperty(lockId, publicKey!) as AccessResponse;
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property access granted',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || 'Failed to access property');
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
      const response = await propertyAPI.revokeAccess(lockId, publicKey!) as AccessResponse;
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Access revoked successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchDigitalKeys(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to revoke access');
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
          Please connect your wallet to view your digital keys
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          My Digital Keys
        </Heading>
        <Text color="gray.600">
          Manage your digital keys and access properties securely
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
      ) : locks.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          You don't have any digital keys yet. Rent a property to get started!
        </Alert>
      ) : (
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
      )}
    </Container>
  );
}