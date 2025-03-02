'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';

interface WalletContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  walletType: 'tenant' | 'owner' | null;
  setWalletType: (type: 'tenant' | 'owner' | null) => void;
  publicKey: string | null;
  balance: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected, select, connect: connectWallet, disconnect: disconnectWallet, publicKey } = useSolanaWallet();
  const { connection } = useConnection();
  const [walletType, setWalletType] = useState<'tenant' | 'owner' | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch wallet balance when publicKey changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey && connection) {
        try {
          const walletBalance = await connection.getBalance(publicKey);
          setBalance(walletBalance / 1000000000); // Convert lamports to SOL
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  const connect = useCallback(async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWallet]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      setWalletType(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnectWallet]);

  // If wallet is disconnected, reset wallet type
  useEffect(() => {
    if (!connected) {
      setWalletType(null);
    }
  }, [connected]);

  const value = {
    isConnected: connected,
    connect,
    disconnect,
    walletType,
    setWalletType,
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

// Simpler alias to match the imports in other files
export const useWallet = useAppWallet;
