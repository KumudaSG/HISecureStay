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
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/property/property-card';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

interface Property {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  min_duration: number;
  max_duration: number;
  smart_lock_id: string;
  is_available: boolean;
  owner: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  images: string[];
  amenities: string[];
  status: string;
}

export default function MyProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchMyProperties();
    }
  }, [isConnected, publicKey]);

  const fetchMyProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyAPI.getMyProperties(publicKey!);
      if (response.success && response.data.properties) {
        setProperties(response.data.properties);
      } else {
        setError('Failed to load properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your properties
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            My Properties
          </Heading>
          <Text color="gray.600">
            Manage your listed properties and view their status
          </Text>
        </Box>

        <Button
          colorScheme="blue"
          alignSelf="flex-start"
          onClick={() => router.push('/properties/new')}
        >
          List New Property
        </Button>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : properties.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            You haven't listed any properties yet. Click &quot;List New Property&quot; to get started!
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}