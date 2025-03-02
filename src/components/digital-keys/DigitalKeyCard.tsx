'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Divider,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { format, isAfter, isBefore } from 'date-fns';
import { AccessKeyData } from '@/services/apiAdapter';
import { useBlockchainService } from '@/services/blockchainService';
import { Key, LockOpen, LockKey } from '@phosphor-icons/react';

interface DigitalKeyCardProps {
  accessKey: AccessKeyData;
  onUnlock?: () => void;
}

export const DigitalKeyCard: React.FC<DigitalKeyCardProps> = ({ accessKey, onUnlock }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const toast = useToast();
  const { validateAccess } = useBlockchainService();

  const isExpired = isAfter(new Date(), new Date(accessKey.validTo));
  const isNotYetValid = isBefore(new Date(), new Date(accessKey.validFrom));
  
  const getStatusColor = () => {
    if (!accessKey.isActive) return 'red';
    if (isExpired) return 'orange';
    if (isNotYetValid) return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (!accessKey.isActive) return 'Inactive';
    if (isExpired) return 'Expired';
    if (isNotYetValid) return 'Not Yet Valid';
    return 'Active';
  };

  const handleUnlock = async () => {
    try {
      setIsUnlocking(true);
      
      // Call the blockchain service to validate access
      await validateAccess(accessKey.id, accessKey.propertyId);
      
      toast({
        title: 'Door unlocked',
        description: 'Access granted to the property',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onUnlock) {
        onUnlock();
      }
    } catch (error) {
      console.error('Error unlocking door:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlock door. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="md"
      bg="white"
      position="relative"
      overflow="hidden"
    >
      {/* Key icon watermark */}
      <Box 
        position="absolute" 
        right="-20px" 
        bottom="-20px" 
        opacity="0.05" 
        zIndex="0"
      >
        <Icon as={Key} boxSize="150px" />
      </Box>
      
      <VStack spacing={4} align="stretch" position="relative" zIndex="1">
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={LockKey} boxSize="24px" color="blue.500" />
            <Text fontSize="lg" fontWeight="bold">
              Digital Key
            </Text>
          </HStack>
          <Badge colorScheme={getStatusColor()} fontSize="sm">
            {getStatusText()}
          </Badge>
        </Flex>
        
        <VStack align="stretch" spacing={2}>
          <Text fontWeight="semibold">{accessKey.propertyTitle}</Text>
          <Text fontSize="sm" color="gray.600">
            Key ID: {accessKey.id.slice(0, 8)}...{accessKey.id.slice(-4)}
          </Text>
        </VStack>
        
        <Divider />
        
        <VStack align="stretch" spacing={1}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Valid From:</Text>
            <Text fontSize="sm">{format(new Date(accessKey.validFrom), 'MMM dd, yyyy')}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Valid To:</Text>
            <Text fontSize="sm">{format(new Date(accessKey.validTo), 'MMM dd, yyyy')}</Text>
          </HStack>
          {accessKey.lastUsed && (
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Last Used:</Text>
              <Text fontSize="sm">{format(new Date(accessKey.lastUsed), 'MMM dd, yyyy HH:mm')}</Text>
            </HStack>
          )}
        </VStack>
        
        <Button
          leftIcon={<Icon as={LockOpen} />}
          colorScheme="blue"
          isLoading={isUnlocking}
          loadingText="Unlocking..."
          onClick={handleUnlock}
          isDisabled={!accessKey.isActive || isExpired || isNotYetValid}
        >
          Unlock Door
        </Button>
        
        {(isExpired || !accessKey.isActive || isNotYetValid) && (
          <Text fontSize="xs" color="red.500" textAlign="center">
            {isExpired ? 'This key has expired.' : 
             isNotYetValid ? 'This key is not yet valid.' : 
             'This key has been deactivated.'}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default DigitalKeyCard;
