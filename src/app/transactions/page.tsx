'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { propertyAPI } from '@/services/api';
import { useAppWallet } from '@/context/WalletContext';

interface Transaction {
  id: string;
  type: 'rental' | 'deposit' | 'withdrawal' | 'refund';
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  propertyName?: string;
  counterparty: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, publicKey } = useAppWallet();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchTransactions();
    }
  }, [isConnected, publicKey]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyAPI.getTransactions(publicKey!);
      if (response.success && response.data.transactions) {
        setTransactions(response.data.transactions);
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${(amount / 1000000000).toFixed(2)} SOL`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rental':
        return 'blue';
      case 'deposit':
        return 'green';
      case 'withdrawal':
        return 'orange';
      case 'refund':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your transactions
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Transaction History
          </Heading>
          <Text color="gray.600">
            View your rental payments and other transactions
          </Text>
        </Box>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : transactions.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No transactions found
          </Alert>
        ) : (
          <VStack spacing={4} align="stretch">
            {transactions.map((tx) => (
              <Box
                key={tx.id}
                p={4}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="sm"
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Badge colorScheme={getTypeColor(tx.type)}>
                        {tx.type.toUpperCase()}
                      </Badge>
                      <Badge colorScheme={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </HStack>
                    <Text fontWeight="bold">
                      {formatAmount(tx.amount)}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    {tx.propertyName && (
                      <Text fontWeight="medium">{tx.propertyName}</Text>
                    )}
                    <Text color="gray.500" fontSize="sm">
                      {tx.counterparty.slice(0, 8)}...{tx.counterparty.slice(-8)}
                    </Text>
                    <Text fontSize="sm">{tx.description}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}