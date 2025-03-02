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
  id: string;
  name: string;
  title?: string;
  description: string;
  price_per_day?: number;
  price?: number;
  min_duration?: number;
  max_duration?: number;
  smart_lock_id?: string;
  smartLockId?: string;
  is_available: boolean;
  availability?: boolean;
  owner: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  images: string[];
  amenities: string[];
  status?: string;
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Format price (handling both regular SOL values and lamports)
  const formatPrice = (price: number | undefined) => {
    if (!price) return '0.00';
    // If price is already in SOL (small number), return it directly
    // Otherwise convert from lamports (1 SOL = 1,000,000,000 lamports)
    return price > 1000 ? (price / 1000000000).toFixed(2) : price.toFixed(2);
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
      onClick={() => router.push(`/properties/${property.id.toString()}`)}
    >
      {/* Property Image */}
      <Image 
        src={property.images && property.images.length > 0 
          ? property.images[0] 
          : 'https://via.placeholder.com/400x250?text=Property'} 
        alt={property.name || property.title || 'Property'}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      
      {/* Badge for availability */}
      <Box position="absolute" top="10px" right="10px">
        <Badge 
          borderRadius="full" 
          px="2" 
          colorScheme={(property.is_available || property.availability) ? 'green' : 'red'}
        >
          {(property.is_available || property.availability) ? 'Available' : 'Booked'}
        </Badge>
      </Box>
      
      <Box p={5}>
        <VStack align="start" spacing={3}>
          {/* Property Name */}
          <Heading size="md" lineHeight="tight" isTruncated>
            {property.name || property.title}
          </Heading>
          
          {/* Location */}
          <Text fontSize="sm" color={textColor}>
            {property.location.city}, {property.location.state}
          </Text>
          
          {/* Price */}
          <HStack>
            <Text fontWeight="bold" fontSize="xl">
              {formatPrice(property.price_per_day || property.price)} SOL
            </Text>
            <Text fontSize="sm" color="gray.500">
              / day
            </Text>
          </HStack>
          
          {/* Duration */}
          <Text fontSize="sm">
            {property.min_duration || 1} to {property.max_duration || 30} days
          </Text>
          
          {/* Amenities */}
          <Box>
            <Flex flexWrap="wrap" gap={2} mt={2}>
              {property.amenities && property.amenities.slice(0, 3).map((amenity, index) => (
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
              {property.amenities && property.amenities.length > 3 && (
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
              e.stopPropagation(); // Prevent triggering the parent onClick
              router.push(`/properties/${property.id.toString()}`);
            }}
          >
            View Details
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};