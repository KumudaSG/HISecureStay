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
import { PropertyDisplayData } from '@/types';

interface PropertyCardProps {
  property: PropertyDisplayData;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Format price from lamports (1 SOL = 1,000,000,000 lamports)
  const formatPrice = (lamports: number) => {
    return (lamports / 1000000000).toFixed(2);
  };
  
  // Default values for potentially missing properties
  const isAvailable = property.is_available !== undefined ? property.is_available : 
                     (property.status === 'available');
  const minDuration = property.min_duration || 1;
  const maxDuration = property.max_duration || 30;
  const amenities = property.amenities || [];
  
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
        alt={property.name}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      
      {/* Badge for availability */}
      <Box position="absolute" top="10px" right="10px">
        <Badge 
          borderRadius="full" 
          px="2" 
          colorScheme={isAvailable ? 'green' : 'red'}
        >
          {isAvailable ? 'Available' : 'Booked'}
        </Badge>
      </Box>
      
      <Box p={5}>
        <VStack align="start" spacing={3}>
          {/* Property Name */}
          <Heading size="md" lineHeight="tight" isTruncated>
            {property.name}
          </Heading>
          
          {/* Location */}
          <Text fontSize="sm" color={textColor}>
            {property.location.city}, {property.location.state}
          </Text>
          
          {/* Price */}
          <HStack>
            <Text fontWeight="bold" fontSize="xl">
              {formatPrice(property.price_per_day)} SOL
            </Text>
            <Text fontSize="sm" color="gray.500">
              / day
            </Text>
          </HStack>
          
          {/* Duration */}
          <Text fontSize="sm">
            {minDuration} to {maxDuration} days
          </Text>
          
          {/* Amenities */}
          <Box>
            <Flex flexWrap="wrap" gap={2} mt={2}>
              {amenities.slice(0, 3).map((amenity, index) => (
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
              {amenities.length > 3 && (
                <Badge 
                  borderRadius="full" 
                  px={2} 
                  colorScheme="gray"
                  variant="outline"
                >
                  +{amenities.length - 3} more
                </Badge>
              )}
            </Flex>
          </Box>
          
          {/* View Details Button */}
          <Button 
            mt={2} 
            colorScheme="blue" 
            w="full"
            onClick={() => router.push(`/properties/${property.id}`)}
          >
            View Details
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};