'use client';

import React from 'react';
import {
  Box,
  Image,
  Badge,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  owner: string;
  amenities: string[];
  availability: boolean;
  smartLockId?: string;
  currentTenant?: string;
  rentalStart?: string;
  rentalEnd?: string;
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Format price from dollars to SOL (for demo purposes)
  const formatPrice = (price: number) => {
    return (price / 1000000000).toFixed(2);
  };

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <Box 
      maxW="sm" 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      boxShadow="md"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg'
      }}
      cursor="pointer"
      onClick={() => router.push(`/properties/${property.id}`)}
    >
      {/* Property Image */}
      <Image 
        src={property.images[0] || 'https://via.placeholder.com/400x250?text=Property'} 
        alt={property.title}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      
      {/* Badge for availability */}
      <Box position="absolute" top="10px" right="10px">
        <Badge 
          borderRadius="full" 
          px="2" 
          colorScheme={property.availability ? 'green' : 'red'}
        >
          {property.availability ? 'Available' : 'Booked'}
        </Badge>
      </Box>
      
      <Box p={5}>
        <VStack align="start" spacing={3}>
          {/* Property Title */}
          <Heading size="md" lineHeight="tight" isTruncated>
            {property.title}
          </Heading>
          
          {/* Location */}
          <Text fontSize="sm" color={textColor}>
            {property.location}
          </Text>
          
          {/* Price */}
          <HStack>
            <Text fontWeight="bold" fontSize="xl">
              {formatPrice(property.price)} SOL
            </Text>
            <Text fontSize="sm" color="gray.500">
              / day
            </Text>
          </HStack>
          
          {/* Rental Period if booked */}
          {!property.availability && property.rentalStart && property.rentalEnd && (
            <Text fontSize="sm" color="red.500">
              Booked: {formatDate(property.rentalStart)} - {formatDate(property.rentalEnd)}
            </Text>
          )}
          
          {/* Amenities */}
          <Box>
            <Flex flexWrap="wrap" gap={2} mt={2}>
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge 
                  key={index} 
                  borderRadius="full" 
                  px={2} 
                  colorScheme="blue"
                  variant="outline"
                >
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge 
                  borderRadius="full" 
                  px={2} 
                  colorScheme="gray"
                  variant="outline"
                >
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </Flex>
          </Box>
          
          {/* View Details Button */}
          <Button 
            mt={2} 
            colorScheme="blue" 
            w="full"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/properties/${property.id}`);
            }}
          >
            View Details
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};