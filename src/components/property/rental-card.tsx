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

interface Rental {
  id: number;
  propertyId: number;
  name: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  smartLockAccess: boolean;
  image: string;
}

interface RentalCardProps {
  rental: Rental;
}

export const RentalCard: React.FC<RentalCardProps> = ({ rental }) => {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Format price from lamports (1 SOL = 1,000,000,000 lamports)
  const formatPrice = (lamports: number) => {
    return (lamports / 1000000000).toFixed(2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      onClick={() => router.push(`/properties/${rental.propertyId}`)}
    >
      {/* Property Image */}
      <Image 
        src={rental.image || 'https://via.placeholder.com/400x250?text=Property'} 
        alt={rental.name}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      
      {/* Badge for status */}
      <Box position="absolute" top="10px" right="10px">
        <Badge 
          borderRadius="full" 
          px="2" 
          colorScheme={rental.status === 'active' ? 'green' : 'gray'}
        >
          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
        </Badge>
      </Box>
      
      <Box p={5}>
        <VStack align="start" spacing={3}>
          {/* Property Name */}
          <Heading size="md" lineHeight="tight" isTruncated>
            {rental.name}
          </Heading>
          
          {/* Rental Period */}
          <Text fontSize="sm" color={textColor}>
            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
          </Text>
          
          {/* Total Price */}
          <HStack>
            <Text fontWeight="bold" fontSize="xl">
              {formatPrice(rental.totalPrice)} SOL
            </Text>
            <Text fontSize="sm" color="gray.500">
              total
            </Text>
          </HStack>
          
          {/* Smart Lock Access */}
          <Box>
            <Badge 
              borderRadius="full" 
              px={2} 
              colorScheme={rental.smartLockAccess ? "blue" : "gray"}
              variant={rental.smartLockAccess ? "solid" : "outline"}
            >
              {rental.smartLockAccess ? "Digital Key Available" : "No Digital Key"}
            </Badge>
          </Box>
          
          {/* View Details Button */}
          <Button 
            mt={2} 
            colorScheme="blue" 
            w="full"
            onClick={() => router.push(`/properties/${rental.propertyId}`)}
          >
            View Property
          </Button>
          
          {/* Access Button (if digital key is available) */}
          {rental.smartLockAccess && (
            <Button 
              mt={2} 
              colorScheme="green" 
              w="full"
              onClick={(e) => {
                e.stopPropagation();
                router.push('/digital-keys');
              }}
            >
              Access Digital Key
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
