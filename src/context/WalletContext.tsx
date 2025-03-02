'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@chakra-ui/react';

interface WalletContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletType: 'tenant' | 'owner' | null;
  setWalletType: (type: 'tenant' | 'owner' | null) => void;
  publicKey: string | null;
  balance: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected, select, connect: connectWallet, disconnect: disconnectWallet, publicKey } = useSolanaWallet();
  const [walletType, setWalletType] = useState<'tenant' | 'owner' | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const toast = useToast();

  // Load wallet type from localStorage on mount - client-side only
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    if (connected && publicKey) {
      const savedWalletType = localStorage.getItem(`walletType_${publicKey.toString()}`);
      if (savedWalletType === 'tenant' || savedWalletType === 'owner') {
        setWalletType(savedWalletType);
      } else {
        // Default to tenant if not set
        setWalletType('tenant');
        localStorage.setItem(`walletType_${publicKey.toString()}`, 'tenant');
      }
      
      // Set a mock balance for demo purposes
      setBalance(Math.random() * 10 + 1); // Random balance between 1-11 SOL
    }
  }, [connected, publicKey]);

  // Handle wallet type change
  const handleSetWalletType = useCallback((type: 'tenant' | 'owner' | null) => {
    setWalletType(type);
    
    // Only use localStorage on client-side
    if (typeof window !== 'undefined' && type && publicKey) {
      localStorage.setItem(`walletType_${publicKey.toString()}`, type);
      
      toast({
        title: `Switched to ${type} mode`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [publicKey, toast]);

  const connect = useCallback(async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setWalletType(null);
    setBalance(null);
  }, [disconnectWallet]);

  const value = {
    isConnected: connected,
    connect,
    disconnect,
    walletType,
    setWalletType: handleSetWalletType,
    publicKey: publicKey?.toBase58() || null,
    balance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useAppWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useAppWallet must be used within a WalletProvider');
  }
  return context;
};

// For backward compatibility
export const useWallet = useAppWallet;
