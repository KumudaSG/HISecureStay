import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { useAnchorProvider } from '@/components/solana/solana-provider';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

// This would be your actual program ID from Anchor.toml or your deployed program
const PROGRAM_ID = '9GmbEnoSYVse4AADADyKNfy4s3XWC3oKzzWb8HxazHjx';

export const useBlockchainService = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const provider = useAnchorProvider();

  // Function to get account balance
  const getBalance = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }, [connection, publicKey]);

  // Function to send SOL
  const sendSol = useCallback(
    async (recipient: string, amount: number) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        const recipientPubkey = new PublicKey(recipient);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );

        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'confirmed');
        
        toast.success(`Transaction successful: ${signature}`);
        return signature;
      } catch (error) {
        console.error('Error sending SOL:', error);
        toast.error('Transaction failed');
        throw error;
      }
    },
    [connection, publicKey, sendTransaction]
  );

  // Function to list a property on the blockchain
  const listProperty = useCallback(
    async (propertyData: any) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        // In a real implementation, you would:
        // 1. Load the program using the IDL
        // const program = new Program(idl, new PublicKey(PROGRAM_ID), provider);
        // 2. Call the appropriate program method
        // await program.methods.listProperty(propertyData).accounts({...}).rpc();

        // For now, we'll just mock the response
        toast.success('Property listed on blockchain');
        return {
          success: true,
          propertyId: Math.floor(Math.random() * 1000000),
          transactionSignature: 'mock_tx_signature_' + Date.now(),
        };
      } catch (error) {
        console.error('Error listing property on blockchain:', error);
        toast.error('Failed to list property on blockchain');
        throw error;
      }
    },
    [publicKey, provider]
  );

  // Function to book a property on the blockchain
  const bookProperty = useCallback(
    async (propertyId: number, bookingData: any) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        // In a real implementation, you would:
        // 1. Load the program
        // 2. Call the appropriate program method

        // For now, we'll just mock the response
        toast.success('Property booked on blockchain');
        return {
          success: true,
          rentalId: Math.floor(Math.random() * 1000000),
          transactionSignature: 'mock_tx_signature_' + Date.now(),
        };
      } catch (error) {
        console.error('Error booking property on blockchain:', error);
        toast.error('Failed to book property on blockchain');
        throw error;
      }
    },
    [publicKey, provider]
  );

  // Function to generate a digital key
  const generateDigitalKey = useCallback(
    async (propertyId: number, tenantData: any) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        // In a real implementation, you would:
        // 1. Load the program
        // 2. Call the appropriate program method

        // For now, we'll just mock the response
        toast.success('Digital key generated on blockchain');
        return {
          success: true,
          digitalKey: {
            accessToken: 'access_' + Math.random().toString(36).substring(2, 15),
            issuedAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
            propertyId,
          },
          transactionSignature: 'mock_tx_signature_' + Date.now(),
        };
      } catch (error) {
        console.error('Error generating digital key:', error);
        toast.error('Failed to generate digital key');
        throw error;
      }
    },
    [publicKey, provider]
  );

  return {
    getBalance,
    sendSol,
    listProperty,
    bookProperty,
    generateDigitalKey,
  };
};
