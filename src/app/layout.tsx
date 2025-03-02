import './globals.css'
import { ClusterProvider } from '@/components/cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { UiLayout } from '@/components/ui/ui-layout'
import { ReactQueryProvider } from './react-query-provider'
import { ChakraProvider } from '@chakra-ui/react'
import { WalletProvider } from '@/context/WalletContext'
import { ModeProvider } from '@/context/ModeContext'

export const metadata = {
  title: 'SecureStay',
  description: 'Blockchain-based property rental platform',
}

const links: { label: string; path: string }[] = [
  { label: 'Properties', path: '/properties' },
  { label: 'Digital Keys', path: '/digital-keys' },
  { label: 'My Rentals', path: '/my-rentals' },
  { label: 'My Properties', path: '/my-properties' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ChakraProvider>
            <ClusterProvider>
              <SolanaProvider>
                <ModeProvider>
                  <WalletProvider>
                    <UiLayout links={links}>{children}</UiLayout>
                  </WalletProvider>
                </ModeProvider>
              </SolanaProvider>
            </ClusterProvider>
          </ChakraProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
