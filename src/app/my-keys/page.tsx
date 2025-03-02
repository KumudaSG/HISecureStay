'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Key } from '@phosphor-icons/react';
import apiAdapter from '@/services/apiAdapter';
import { DigitalKeyCard } from '@/components/digital-keys/DigitalKeyCard';
import { AccessKeyData } from '@/services/apiAdapter';

export default function MyKeysPage() {
  const { publicKey, connected } = useWallet();
  const [keys, setKeys] = useState<AccessKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchKeys = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const fetchedKeys = await apiAdapter.getAccessKeys(publicKey.toString(), true);
      setKeys(fetchedKeys);
    } catch (err) {
      console.error('Error fetching digital keys:', err);
      setError('Failed to load your digital keys. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchKeys();
    } else {
      setKeys([]);
      setLoading(false);
    }
  }, [connected, publicKey]);

  const handleUnlock = () => {
    toast({
      title: 'Access granted',
      description: 'The door has been unlocked successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            My Digital Keys
          </Heading>
          <Text color="gray.600">
            View and manage your digital keys for property access
          </Text>
        </Box>

        {!connected && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Wallet not connected!</AlertTitle>
            <AlertDescription>
              Please connect your wallet to view your digital keys.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="blue.500" />
            <Text mt={4}>Loading your digital keys...</Text>
          </Box>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : keys.length === 0 ? (
          <Box 
            p={10} 
            borderWidth="1px" 
            borderRadius="lg" 
            textAlign="center"
            bg="gray.50"
          >
            <Icon as={Key} boxSize="50px" color="gray.400" mb={4} />
            <Heading as="h3" size="md" mb={2}>
              No Digital Keys Found
            </Heading>
            <Text color="gray.600" mb={6}>
              You don't have any digital keys yet. Book a property to receive a digital key.
            </Text>
            <Button colorScheme="blue" onClick={() => window.location.href = '/properties'}>
              Browse Properties
            </Button>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {keys.map((key) => (
                <DigitalKeyCard 
                  key={key.id} 
                  accessKey={key} 
                  onUnlock={handleUnlock}
                />
              ))}
            </SimpleGrid>
            
            <Box mt={6} textAlign="center">
              <Button 
                colorScheme="blue" 
                variant="outline" 
                onClick={fetchKeys}
              >
                Refresh Keys
              </Button>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
}
