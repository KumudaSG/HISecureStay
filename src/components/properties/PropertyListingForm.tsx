'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  useToast,
  Text,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBlockchainService } from '@/services/blockchainService';
import apiAdapter from '@/services/apiAdapter';
import { useRouter } from 'next/navigation';

export const PropertyListingForm: React.FC = () => {
  const { publicKey } = useWallet();
  const { listProperty } = useBlockchainService();
  const toast = useToast();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockchainTxInProgress, setBlockchainTxInProgress] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914'],
    amenities: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (valueString: string) => {
    setFormData((prev) => ({ ...prev, price: valueString }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to list a property',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // First, create the property in the database
      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        images: formData.images,
        owner: publicKey.toString(),
        amenities: formData.amenities.split(',').map((item) => item.trim()),
        availability: true,
      };
      
      const createdProperty = await apiAdapter.createProperty(propertyData);
      
      toast({
        title: 'Property created',
        description: 'Your property has been created in the database',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Now, list the property on the blockchain
      setBlockchainTxInProgress(true);
      
      const blockchainResult = await listProperty(propertyData);
      
      toast({
        title: 'Property listed on blockchain',
        description: `Transaction signature: ${blockchainResult.transactionSignature.slice(0, 10)}...`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form and redirect
      setFormData({
        title: '',
        description: '',
        location: '',
        price: '',
        images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914'],
        amenities: '',
      });
      
      // Redirect to the property page
      router.push(`/properties/${createdProperty.id}`);
      
    } catch (error) {
      console.error('Error listing property:', error);
      toast({
        title: 'Error',
        description: 'Failed to list property. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setBlockchainTxInProgress(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter property title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your property"
              rows={4}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Location</FormLabel>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Property location"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Price per day (SOL)</FormLabel>
            <NumberInput min={0} value={formData.price} onChange={handlePriceChange}>
              <NumberInputField placeholder="0.1" />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Amenities (comma-separated)</FormLabel>
            <Input
              name="amenities"
              value={formData.amenities}
              onChange={handleInputChange}
              placeholder="WiFi, Pool, Parking, etc."
            />
          </FormControl>

          <Divider />

          <Box>
            <Text fontSize="sm" mb={2}>
              By listing your property, you agree to the terms and conditions of our platform.
            </Text>
            <Text fontSize="sm" mb={4} color="blue.600">
              Your property will be listed on the Solana blockchain for secure and transparent rental management.
            </Text>
          </Box>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isSubmitting}
            loadingText={blockchainTxInProgress ? "Confirming on blockchain..." : "Creating listing..."}
            isDisabled={!publicKey}
          >
            List Property
          </Button>

          {!publicKey && (
            <Text color="red.500" fontSize="sm">
              Please connect your wallet to list a property.
            </Text>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default PropertyListingForm;
