'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Select,
  InputGroup,
  InputLeftElement,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

export default function NewProperty() {
  const router = useRouter();
  const toast = useToast();
  const { isConnected, publicKey } = useAppWallet();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_day: 0.1, // in SOL
    min_duration: 1,
    max_duration: 30,
    smart_lock_id: '',
    address: '',
    city: '',
    state: '',
    images: ['https://images.unsplash.com/photo-1518563259479-d003c05a6507'],
    amenities: [] as string[],
  });
  
  // For amenities input
  const [amenityInput, setAmenityInput] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  const handleNumberChange = (name: string, value: number) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user changes number
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };
  
  const handleRemoveAmenity = (index: number) => {
    const newAmenities = [...formData.amenities];
    newAmenities.splice(index, 1);
    setFormData({ ...formData, amenities: newAmenities });
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'Property name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.price_per_day <= 0) errors.price_per_day = 'Price must be greater than 0';
    if (formData.min_duration < 1) errors.min_duration = 'Minimum duration must be at least 1 day';
    if (formData.max_duration < formData.min_duration) {
      errors.max_duration = 'Maximum duration must be greater than or equal to minimum duration';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (formData.amenities.length === 0) errors.amenities = 'At least one amenity is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to list a property',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert price from SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const priceInLamports = Math.floor(formData.price_per_day * 1000000000);
      
      const propertyData = {
        ...formData,
        price_per_day: priceInLamports,
        owner: publicKey,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
        is_available: true,
      };
      
      const response = await propertyAPI.createProperty(propertyData);
      
      if (response.success) {
        toast({
          title: 'Property listed successfully',
          description: 'Your property has been listed and is now available for rental',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/my-properties');
      } else {
        throw new Error(response.error || 'Failed to list property');
      }
    } catch (error) {
      console.error('Error listing property:', error);
      toast({
        title: 'Error listing property',
        description: 'There was an error listing your property. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <Container maxW="800px" py={8}>
        <VStack spacing={4} align="center">
          <Heading>Connect Wallet</Heading>
          <Text>Please connect your wallet to list a property</Text>
          <Button colorScheme="blue" onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="800px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            List New Property
          </Heading>
          <Text color="gray.600">
            Fill out the form below to list your property for rental
          </Text>
        </Box>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Basic Information
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!formErrors.name}>
                  <FormLabel>Property Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Beachfront Villa"
                  />
                  <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={!!formErrors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property..."
                    rows={4}
                  />
                  <FormErrorMessage>{formErrors.description}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Pricing & Duration */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Pricing & Duration
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!formErrors.price_per_day}>
                  <FormLabel>Price per Day (SOL)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.500">
                      ◎
                    </InputLeftElement>
                    <NumberInput
                      min={0.01}
                      step={0.01}
                      precision={2}
                      value={formData.price_per_day}
                      onChange={(_, value) => handleNumberChange('price_per_day', value)}
                    >
                      <NumberInputField pl={8} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                  <FormErrorMessage>{formErrors.price_per_day}</FormErrorMessage>
                </FormControl>
                
                <Flex gap={4}>
                  <FormControl isRequired isInvalid={!!formErrors.min_duration}>
                    <FormLabel>Minimum Stay (days)</FormLabel>
                    <NumberInput
                      min={1}
                      value={formData.min_duration}
                      onChange={(_, value) => handleNumberChange('min_duration', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{formErrors.min_duration}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!formErrors.max_duration}>
                    <FormLabel>Maximum Stay (days)</FormLabel>
                    <NumberInput
                      min={1}
                      value={formData.max_duration}
                      onChange={(_, value) => handleNumberChange('max_duration', value)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{formErrors.max_duration}</FormErrorMessage>
                  </FormControl>
                </Flex>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Location */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Location
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!formErrors.address}>
                  <FormLabel>Address</FormLabel>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                  <FormErrorMessage>{formErrors.address}</FormErrorMessage>
                </FormControl>
                
                <Flex gap={4}>
                  <FormControl isRequired isInvalid={!!formErrors.city}>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                    <FormErrorMessage>{formErrors.city}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!formErrors.state}>
                    <FormLabel>State</FormLabel>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                    <FormErrorMessage>{formErrors.state}</FormErrorMessage>
                  </FormControl>
                </Flex>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Amenities */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Amenities
              </Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!formErrors.amenities}>
                  <FormLabel>Add Amenities</FormLabel>
                  <Flex>
                    <Input
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      placeholder="e.g., WiFi, Pool, etc."
                      mr={2}
                    />
                    <Button onClick={handleAddAmenity}>Add</Button>
                  </Flex>
                  <FormErrorMessage>{formErrors.amenities}</FormErrorMessage>
                </FormControl>
                
                <Box>
                  <HStack spacing={2} flexWrap="wrap">
                    {formData.amenities.map((amenity, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                        m={1}
                      >
                        <TagLabel>{amenity}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveAmenity(index)} />
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Smart Lock */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Smart Lock
              </Heading>
              
              <FormControl>
                <FormLabel>Smart Lock ID (Optional)</FormLabel>
                <Input
                  name="smart_lock_id"
                  value={formData.smart_lock_id}
                  onChange={handleInputChange}
                  placeholder="Enter your smart lock ID if available"
                />
              </FormControl>
            </Box>
            
            <Box pt={6}>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Listing Property..."
              >
                List Property
              </Button>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
