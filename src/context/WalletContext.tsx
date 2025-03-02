'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

interface WalletContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  walletType: 'tenant' | 'owner' | null;
  setWalletType: (type: 'tenant' | 'owner' | null) => void;
  publicKey: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected, select, connect: connectWallet, publicKey } = useSolanaWallet();
  const [walletType, setWalletType] = useState<'tenant' | 'owner' | null>(null);

  const connect = useCallback(async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWallet]);

  const value = {
    isConnected: connected,
    connect,
    walletType,
    setWalletType,
    publicKey: publicKey?.toBase58() || null,
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
