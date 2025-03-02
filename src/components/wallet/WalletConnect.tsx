'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { useAppWallet } from '@/context/WalletContext';
import { Button, Box, Text, VStack, HStack, useToast } from '@chakra-ui/react';

export const WalletConnect: React.FC = () => {
  const { publicKey, disconnect } = useWallet();
  const { walletType, setWalletType } = useAppWallet();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSetWalletType = (type: 'tenant' | 'owner') => {
    setIsLoading(true);
    
    // Simulate a loading state
    setTimeout(() => {
      setWalletType(type);
      setIsLoading(false);
      
      toast({
        title: 'Wallet type set',
        description: `You are now using the app as a ${type}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletType(null);
    
    toast({
      title: 'Wallet disconnected',
      description: 'Your wallet has been disconnected.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      {!publicKey ? (
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Connect your wallet</Text>
            <Text fontSize="sm" color="gray.600">
              Connect your Solana wallet to access all features of the platform.
            </Text>
            <WalletButton />
          </VStack>
        </Box>
      ) : (
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Wallet connected</Text>
            <Text fontSize="sm" wordBreak="break-all">
              {publicKey.toString()}
            </Text>
            
            {!walletType ? (
              <VStack spacing={2}>
                <Text fontSize="sm">What would you like to do?</Text>
                <HStack spacing={2}>
                  <Button 
                    colorScheme="blue" 
                    size="sm" 
                    onClick={() => handleSetWalletType('tenant')}
                    isLoading={isLoading}
                  >
                    I want to rent
                  </Button>
                  <Button 
                    colorScheme="green" 
                    size="sm" 
                    onClick={() => handleSetWalletType('owner')}
                    isLoading={isLoading}
                  >
                    I own properties
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Text fontSize="sm">
                  You are using the app as a <strong>{walletType}</strong>
                </Text>
                <HStack spacing={2}>
                  <Button 
                    colorScheme="red" 
                    size="sm" 
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    colorScheme="gray" 
                    size="sm" 
                    onClick={() => setWalletType(null)}
                  >
                    Change role
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default WalletConnect;
