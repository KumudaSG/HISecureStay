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
import { PropertyDisplayData, RentalResponse } from '@/types';

export default function MyRentals() {
  const [rentals, setRentals] = useState<PropertyDisplayData[]>([]);
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
      const response = await propertyAPI.getMyRentals(publicKey!) as RentalResponse;
      if (response.success && response.data.rentals) {
        setRentals(response.data.rentals);
      } else {
        setError('Failed to load rentals');
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
              <PropertyCard key={property.id} property={property} />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}