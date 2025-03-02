'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { useAppWallet } from '@/context/WalletContext';

interface SmartLock {
  id: string;
  propertyName: string;
  status: 'active' | 'inactive' | 'expired';
  validUntil: string;
  accessCode: string;
}

interface SmartLockProps {
  lock: SmartLock;
  onAccess?: (id: string) => void;
  onRevoke?: (id: string) => void;
}

export function SmartLockCard({ lock, onAccess, onRevoke }: SmartLockProps) {
  const { isConnected } = useAppWallet();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      p={6}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            {lock.propertyName}
          </Text>
          <Badge colorScheme={getStatusColor(lock.status)}>
            {lock.status.charAt(0).toUpperCase() + lock.status.slice(1)}
          </Badge>
        </HStack>

        <VStack align="start" spacing={2}>
          <HStack justify="space-between">
            <Text color="gray.500" fontSize="sm">
              Access Code
            </Text>
            <Text fontFamily="monospace">
              {lock.status === 'active' ? lock.accessCode : '••••••'}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.500" fontSize="sm">
              Valid until
            </Text>
            <Text>
              {new Date(lock.validUntil).toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>

        <HStack spacing={4}>
          {onAccess && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => onAccess(lock.id)}
              isDisabled={!isConnected || lock.status !== 'active'}
            >
              Access Property
            </Button>
          )}
          {onRevoke && (
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={() => onRevoke(lock.id)}
              isDisabled={!isConnected || lock.status === 'expired'}
            >
              Revoke Access
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}