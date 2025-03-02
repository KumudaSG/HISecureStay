'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
  SimpleGrid,
  GridItem,
  FormErrorMessage,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

export default function NewProperty() {
  const router = useRouter();
  const toast = useToast();
  const { isConnected, publicKey, walletType } = useAppWallet();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_day: 0.1,
    min_duration: 1,
    max_duration: 30,
    smart_lock_id: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
  });

  // Images and amenities
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newImage, setNewImage] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: parseFloat(value),
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Add image URL
  const handleAddImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages([...images, newImage]);
      setNewImage('');
    }
  };

  // Remove image URL
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Add amenity
  const handleAddAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity('');
    }
  };

  // Remove amenity
  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price_per_day <= 0) {
      newErrors.price_per_day = 'Price must be greater than 0';
    }

    if (formData.min_duration < 1) {
      newErrors.min_duration = 'Minimum duration must be at least 1 day';
    }

    if (formData.max_duration < formData.min_duration) {
      newErrors.max_duration = 'Maximum duration must be greater than minimum duration';
    }

    if (!formData.smart_lock_id.trim()) {
      newErrors.smart_lock_id = 'Smart lock ID is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to list a property',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (walletType !== 'owner') {
      toast({
        title: 'Wrong wallet type',
        description: 'Please switch to owner wallet to list properties',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert price from SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const priceInLamports = Math.floor(formData.price_per_day * 1000000000);

      const propertyData = {
        name: formData.name,
        description: formData.description,
        price_per_day: priceInLamports,
        min_duration: formData.min_duration,
        max_duration: formData.max_duration,
        smart_lock_id: formData.smart_lock_id,
        owner: publicKey,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        images: images,
        amenities: amenities,
      };

      const response = await propertyAPI.createProperty(propertyData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Property listed successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/my-properties');
      } else {
        throw new Error(response.message || 'Failed to list property');
      }
    } catch (error) {
      console.error('Error listing property:', error);
      toast({
        title: 'Error',
        description: 'Failed to list property. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to list a property
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            List New Property
          </Heading>
          <Text color="gray.600">
            Fill out the form below to list your property on HISecureStay
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={8} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Basic Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={!!errors.name} isRequired>
                    <FormLabel>Property Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Beach House, Mountain Cabin"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={!!errors.description} isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your property..."
                      rows={4}
                    />
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <FormControl isInvalid={!!errors.price_per_day} isRequired>
                  <FormLabel>Price per Day (SOL)</FormLabel>
                  <NumberInput
                    min={0.01}
                    step={0.01}
                    precision={2}
                    value={formData.price_per_day}
                    onChange={(value) => handleNumberChange('price_per_day', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.price_per_day}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.smart_lock_id} isRequired>
                  <FormLabel>Smart Lock ID</FormLabel>
                  <Input
                    name="smart_lock_id"
                    value={formData.smart_lock_id}
                    onChange={handleInputChange}
                    placeholder="e.g., LOCK123"
                  />
                  <FormErrorMessage>{errors.smart_lock_id}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.min_duration} isRequired>
                  <FormLabel>Minimum Stay (days)</FormLabel>
                  <NumberInput
                    min={1}
                    value={formData.min_duration}
                    onChange={(value) => handleNumberChange('min_duration', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.min_duration}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.max_duration} isRequired>
                  <FormLabel>Maximum Stay (days)</FormLabel>
                  <NumberInput
                    min={formData.min_duration}
                    value={formData.max_duration}
                    onChange={(value) => handleNumberChange('max_duration', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.max_duration}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Location */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Location
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={!!errors.address} isRequired>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <FormControl isInvalid={!!errors.city} isRequired>
                  <FormLabel>City</FormLabel>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  <FormErrorMessage>{errors.city}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.state} isRequired>
                  <FormLabel>State</FormLabel>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                  <FormErrorMessage>{errors.state}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>ZIP Code</FormLabel>
                  <Input
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Images */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Images
              </Heading>
              <FormControl isInvalid={!!errors.images}>
                <FormLabel>Add Image URLs</FormLabel>
                <InputGroup>
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleAddImage}>
                      Add
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.images}</FormErrorMessage>
              </FormControl>

              <Box mt={4}>
                <HStack spacing={4} flexWrap="wrap">
                  {images.map((image, index) => (
                    <Tag
                      size="lg"
                      key={index}
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      my={1}
                    >
                      <TagLabel>Image {index + 1}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveImage(index)} />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Amenities */}
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Amenities
              </Heading>
              <FormControl>
                <FormLabel>Add Amenities</FormLabel>
                <InputGroup>
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="e.g., Wi-Fi, Pool, Kitchen"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleAddAmenity}>
                      Add
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Box mt={4}>
                <HStack spacing={4} flexWrap="wrap">
                  {amenities.map((amenity, index) => (
                    <Tag
                      size="md"
                      key={index}
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="green"
                      my={1}
                    >
                      <TagLabel>{amenity}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveAmenity(index)} />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Submit Button */}
            <Button
              colorScheme="blue"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Listing Property..."
            >
              List Property
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
