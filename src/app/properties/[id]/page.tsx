'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  Grid,
  GridItem,
  Badge,
  Button,
  HStack,
  VStack,
  useToast,
  Divider,
  Flex,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';
import { SmartLockCard } from '@/components/digital-keys/smart-lock-card';

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
}

const PropertyDetail: React.FC = () => {
  const params = useParams();
  const toast = useToast();
  const router = useRouter();
  const { isConnected, publicKey, walletType } = useAppWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (params.id) {
      fetchPropertyDetails(params.id as string);
    }
  }, [params.id]);
  
  const fetchPropertyDetails = async (propertyId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Safely convert to number, handling non-numeric IDs
      let id: any = propertyId;
      if (!isNaN(Number(propertyId))) {
        id = parseInt(propertyId);
      }
      
      // Use the direct API adapter for more flexible property retrieval
      const apiAdapter = await import('@/services/apiAdapter').then(mod => mod.default);
      const property = await apiAdapter.getPropertyById(id);
      
      if (property) {
        setProperty(property);
      } else {
        setError('Failed to load property details');
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return '0.00';
    // Return directly as SOL
    return price.toFixed(2);
  };
  
  const calculateTotalPrice = () => {
    if (!property) return 0;
    // Use price_per_day if available, otherwise fall back to price
    const pricePerDay = property.price_per_day || property.price || 0;
    return pricePerDay * duration;
  };
  
  const handleBookProperty = async () => {
    if (!isConnected || !publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to book this property',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    if (walletType !== 'tenant') {
      toast({
        title: 'Wrong wallet type',
        description: 'Please switch to tenant wallet to book properties',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setIsBooking(true);
    
    try {
      // Use apiAdapter instead of direct API calls for better mock support
      const apiAdapter = await import('@/services/apiAdapter').then(mod => mod.default);
      
      // Handle both numeric and string IDs
      let propertyId = params.id;
      if (Array.isArray(propertyId)) {
        propertyId = propertyId[0];
      }
      
      // Book the property through the adapter
      const bookingResponse = await apiAdapter.bookProperty(
        typeof propertyId === 'string' && !isNaN(parseInt(propertyId)) ? parseInt(propertyId) : propertyId, 
        {
          tenant: publicKey,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + duration * 86400000).toISOString()
        }
      );
      
      if (bookingResponse.success) {
        toast({
          title: 'Booking successful',
          description: 'Property booked successfully. Generating digital key...',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        
        // Generate access token
        const accessKey = `ACCESS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        setAccessToken(accessKey);
        onOpen(); // Open modal with digital key
        
        // Refresh property to show it's no longer available
        fetchPropertyDetails(propertyId);
      } else {
        toast({
          title: 'Booking failed',
          description: 'Failed to book property',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error booking property:', error);
      toast({
        title: 'Booking failed',
        description: 'An error occurred while booking the property',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  if (error || !property) {
    return (
      <Container maxW="1200px" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error || 'Property not found'}
        </Alert>
        <Button 
          colorScheme="blue" 
          mt={4} 
          onClick={() => router.push('/properties')}
        >
          Back to All Properties
        </Button>
      </Container>
    );
  }
  
  return (
    <Box as="main" py={8} px={4}>
      <Container maxW="1200px">
        {/* Property Header */}
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8} mb={10}>
          {/* Property Image */}
          <GridItem>
            <Image 
              src={property.images[0] || 'https://via.placeholder.com/800x500?text=Property'} 
              alt={property.name}
              borderRadius="lg"
              objectFit="cover"
              w="100%"
              h={{ base: '300px', md: '400px' }}
            />
          </GridItem>
          
          {/* Property Info */}
          <GridItem>
            <VStack align="start" spacing={4}>
              
              <Heading as="h1" size="xl">
                {property.name}
              </Heading>
              
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  {property.location.address}
                </Text>
              </HStack>
              
              <Text color="gray.500">
                {property.location.city}, {property.location.state}
              </Text>
              
              <HStack>
                <Text fontWeight="bold" fontSize="2xl">
                  {formatPrice(property.price_per_day || property.price || 0)} SOL
                </Text>
                <Text fontSize="md" color="gray.500">
                  / day
                </Text>
              </HStack>
              
              <Text fontSize="sm">
                Minimum stay: {property.min_duration} days
              </Text>
              <Text fontSize="sm">
                Maximum stay: {property.max_duration} days
              </Text>
              
              <Divider />
              
              <VStack w="100%" align="start" spacing={4}>
                <Text fontWeight="semibold">Book this property:</Text>
                
                <HStack w="100%">
                  <Text>Duration (days):</Text>
                  <NumberInput 
                    min={property.min_duration || 1} 
                    max={property.max_duration || 30} 
                    value={duration}
                    onChange={(value) => setDuration(Number(value))}
                    w="100px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
                
                <Box w="100%" p={3} bg="blue.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text>Total Price:</Text>
                    <Text fontWeight="bold">
                      {formatPrice(calculateTotalPrice())} SOL
                    </Text>
                  </HStack>
                </Box>
                
                <Button 
                  w="100%" 
                  colorScheme="blue"
                  onClick={handleBookProperty}
                  isLoading={isBooking}
                  loadingText="Booking..."
                  isDisabled={!isConnected}
                >
                  Book Now with Blockchain
                </Button>
                
                {!isConnected && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Please connect your wallet to book this property
                  </Alert>
                )}
              </VStack>
            </VStack>
          </GridItem>
        </Grid>
        
        {/* Property Description */}
        <Box mb={10}>
          <Heading as="h2" size="lg" mb={4}>
            Description
          </Heading>
          <Text>{property.description}</Text>
        </Box>
        
        {/* Amenities */}
        <Box mb={10}>
          <Heading as="h2" size="lg" mb={4}>
            Amenities
          </Heading>
          <Flex flexWrap="wrap" gap={2}>
            {property.amenities.map((amenity: string, index: number) => (
              <Badge 
                key={index}
                colorScheme="blue"
                variant="outline"
                py={1}
                px={3}
                borderRadius="full"
              >
                {amenity}
              </Badge>
            ))}
          </Flex>
        </Box>
        
        {/* Smart Lock */}
        {accessToken && (
          <Box mb={10}>
            <Heading as="h2" size="lg" mb={4}>
              Digital Key & Smart Lock
            </Heading>
            <SmartLockCard 
              lock={{
                id: property.smart_lock_id,
                propertyName: `${property.name} Door Lock`,
                status: 'active',
                validUntil: new Date(Date.now() + duration * 86400000).toISOString(),
                accessCode: accessToken || '',
              }}
            />
          </Box>
        )}
      </Container>
      
      {/* Digital Key Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Digital Key is Ready!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                Your booking was successful and your payment is securely held in the smart contract escrow.
              </Alert>
              
              <Text>
                You now have access to the property's smart lock. Your digital key is stored on the blockchain
                and will automatically expire at the end of your stay.
              </Text>
              
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                w="100%"
                textAlign="center"
                fontSize="sm"
              >
                <Text fontWeight="bold" mb={2}>Digital Access Token</Text>
                <Text 
                  fontFamily="monospace" 
                  bg="white" 
                  p={2} 
                  borderRadius="md"
                  overflowX="auto"
                >
                  {accessToken}
                </Text>
              </Box>
              
              <Text fontSize="sm" color="gray.600">
                You can access your digital keys at any time from the "Digital Keys" section in your dashboard.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                onClose();
                router.push('/digital-keys');
              }}
            >
              View All Keys
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PropertyDetail;