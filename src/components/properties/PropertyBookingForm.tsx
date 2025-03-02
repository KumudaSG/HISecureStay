'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  HStack,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBlockchainService } from '@/services/blockchainService';
import apiAdapter from '@/services/apiAdapter';
import { useRouter } from 'next/navigation';
import { PropertyData } from '@/services/apiAdapter';
import { format, addDays, differenceInDays } from 'date-fns';

interface PropertyBookingFormProps {
  property: PropertyData;
}

export const PropertyBookingForm: React.FC<PropertyBookingFormProps> = ({ property }) => {
  const { publicKey } = useWallet();
  const { bookProperty } = useBlockchainService();
  const toast = useToast();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockchainTxInProgress, setBlockchainTxInProgress] = useState(false);
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.max(1, differenceInDays(end, start));
    return (days * property.price).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to book this property',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // First, book the property in the database
      const bookingData = {
        tenant: publicKey.toString(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: calculateTotalPrice(),
      };
      
      const bookingResult = await apiAdapter.bookProperty(property.id, bookingData);
      
      toast({
        title: 'Property booked',
        description: 'Your booking has been created in the database',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Now, book the property on the blockchain
      setBlockchainTxInProgress(true);
      
      const days = differenceInDays(new Date(formData.endDate), new Date(formData.startDate));
      const blockchainResult = await bookProperty(property.id, {
        ...bookingData,
        durationDays: days,
      });
      
      toast({
        title: 'Property booked on blockchain',
        description: `Transaction signature: ${blockchainResult.transactionSignature.slice(0, 10)}...`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to the my rentals page
      router.push('/my-rentals');
      
    } catch (error) {
      console.error('Error booking property:', error);
      toast({
        title: 'Error',
        description: 'Failed to book property. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setBlockchainTxInProgress(false);
    }
  };

  if (!property.availability) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Property Unavailable
          </Text>
          <Text>
            This property is currently not available for booking.
            {property.currentTenant && (
              <Text mt={2}>
                Currently rented by: <Badge colorScheme="blue">{property.currentTenant.slice(0, 6)}...{property.currentTenant.slice(-4)}</Badge>
              </Text>
            )}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Book this Property
          </Text>
          
          <FormControl isRequired>
            <FormLabel>Check-in Date</FormLabel>
            <Input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Check-out Date</FormLabel>
            <Input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </FormControl>

          <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text>Price per day:</Text>
                <Text>{property.price} SOL</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Total price:</Text>
                <Text fontWeight="bold">{calculateTotalPrice()} SOL</Text>
              </HStack>
            </VStack>
          </Box>

          <Divider />

          <Text fontSize="sm" color="gray.600">
            By booking this property, you agree to the terms and conditions of our platform.
            Your booking will be recorded on the Solana blockchain for secure and transparent rental management.
          </Text>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isSubmitting}
            loadingText={blockchainTxInProgress ? "Confirming on blockchain..." : "Processing booking..."}
            isDisabled={!publicKey}
          >
            Book Now
          </Button>

          {!publicKey && (
            <Text color="red.500" fontSize="sm">
              Please connect your wallet to book this property.
            </Text>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default PropertyBookingForm;
