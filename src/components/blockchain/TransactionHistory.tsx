'use client';

import React, { useEffect, useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, VStack } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { format } from 'date-fns';
import { TransactionData } from '@/services/apiAdapter';
import apiAdapter from '@/services/apiAdapter';

interface TransactionHistoryProps {
  userId?: string;
  propertyId?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, propertyId }) => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let data: TransactionData[] = [];
        
        if (userId) {
          data = await apiAdapter.getTransactionsByUser(userId);
        } else if (propertyId) {
          data = (await apiAdapter.getTransactions()).filter(tx => tx.propertyId === propertyId);
        } else if (publicKey) {
          data = await apiAdapter.getTransactionsByUser(publicKey.toString());
        } else {
          data = await apiAdapter.getTransactions();
        }
        
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, propertyId, publicKey]);

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
      case 'booking':
        return 'blue';
      case 'payment':
        return 'green';
      case 'refund':
        return 'orange';
      case 'deposit':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading transactions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No transactions found.</Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Description</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((tx) => (
            <Tr key={tx.id}>
              <Td>
                <VStack align="start" spacing={0}>
                  <Text>{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {format(new Date(tx.timestamp), 'HH:mm:ss')}
                  </Text>
                </VStack>
              </Td>
              <Td>
                <Badge colorScheme={getTypeColor(tx.type)}>{tx.type}</Badge>
              </Td>
              <Td>{tx.description}</Td>
              <Td isNumeric>{tx.amount} SOL</Td>
              <Td>
                <Badge colorScheme={getStatusColor(tx.status)}>{tx.status}</Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TransactionHistory;
