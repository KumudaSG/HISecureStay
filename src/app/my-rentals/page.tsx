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
  VStack,
} from '@chakra-ui/react';
import { PropertyCard } from '@/components/property/property-card';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

interface Property {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price_per_day?: number;
  price?: number;
  location: {
    address?: string;
    city: string;
    state: string;
  } | string;
  images: string[];
  status?: string;
  rentalStart?: string;
  rentalEnd?: string;
  rental_start?: string;
  rental_end?: string;
  amenities: string[];
  is_available?: boolean;
  availability?: boolean;
}

export default function MyRentals() {
  const [rentals, setRentals] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const toast = useToast();

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchMyRentals();
    }
  }, [isConnected, publicKey]);

  const fetchMyRentals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiAdapter = await import('@/services/apiAdapter').then(mod => mod.default);
      const rentals = await apiAdapter.getMyRentals(publicKey!);
      
      if (rentals && rentals.length > 0) {
        setRentals(rentals);
      } else {
        setRentals([]);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setError('Failed to load rentals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your rentals
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            My Rentals
          </Heading>
          <Text color="gray.600">
            View and manage your current and past rentals
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
        ) : rentals.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            You haven&apos;t rented any properties yet. Browse available properties to get started!
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {rentals.map((property) => (
              <Box key={property.id} position="relative">
                <PropertyCard property={property} />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}