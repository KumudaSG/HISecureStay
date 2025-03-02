'use client'

import dynamic from 'next/dynamic'
import { AnchorProvider } from '@coral-xyz/anchor'
import { WalletError } from '@solana/wallet-adapter-base'
import {
  AnchorWallet,
  useConnection,
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ReactNode, useCallback, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave'

require('@solana/wallet-adapter-react-ui/styles.css')

// Import extended wallet types
import { useWallet as useAppWallet } from '@/context/WalletContext';

// Create a custom wallet button that extends the functionality
const CustomWalletMultiButton = dynamic(
  async () => {
    const { WalletMultiButton } = await import('@solana/wallet-adapter-react-ui');
    const { default: RoleSelector } = await import('./wallet-role-selector');
    return {
      default: (props: any) => {
        // Inject the role selector by overriding WalletMultiButton
        const WalletButton = ({...props}: any) => {
          return <RoleSelector><WalletMultiButton {...props} /></RoleSelector>;
        };
        return <WalletButton {...props} />;
      },
    };
  },
  { ssr: false }
);

// Export the custom wallet button
export const WalletButton = CustomWalletMultiButton;

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])
  const wallets = useMemo(
    () => [
      new BraveWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )
  
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMemo(() => new AnchorProvider(connection, wallet as AnchorWallet, {}), [connection, wallet])
}
