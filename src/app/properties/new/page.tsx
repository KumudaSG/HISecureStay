'use client';

import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { PropertyListingForm } from '@/components/properties/PropertyListingForm';
import { useRouter } from 'next/navigation';
import { useAppWallet } from '@/context/WalletContext';

const NewPropertyPage: React.FC = () => {
  const router = useRouter();
  const { isConnected, walletType } = useAppWallet();
  
  return (
    <Container maxW="900px" py={8}>
      <VStack spacing={6} align="stretch">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push('/')}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push('/properties')}>Properties</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>New Listing</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading size="xl">Create New Property Listing</Heading>
        <Text color="gray.600">
          Fill out the details below to list your property for rent. All properties are secured with blockchain technology.
        </Text>
        
        {!isConnected ? (
          <Box p={6} bg="blue.50" borderRadius="md">
            <VStack spacing={4}>
              <Text>Please connect your wallet to create a property listing.</Text>
              <Button colorScheme="blue" onClick={() => router.push('/')}>
                Connect Wallet
              </Button>
            </VStack>
          </Box>
        ) : walletType !== 'owner' ? (
          <Box p={6} bg="yellow.50" borderRadius="md">
            <VStack spacing={4}>
              <Text>You need to be in owner mode to create property listings.</Text>
              <Button colorScheme="blue" onClick={() => router.push('/')}>
                Switch to Owner Mode
              </Button>
            </VStack>
          </Box>
        ) : (
          <Box p={6} bg="white" borderRadius="md" borderWidth="1px">
            <PropertyListingForm />
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default NewPropertyPage;