// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import BankingIDL from '../target/idl/banking.json'
import type { Banking } from '../target/types/banking'

// Re-export the generated IDL and type
export { Banking, BankingIDL }

// The programId is imported from the program IDL.
export const BANKING_PROGRAM_ID = new PublicKey(BankingIDL.address)

// This is a helper function to get the Banking Anchor program.
export function getBankingProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...BankingIDL, address: address ? address.toBase58() : BankingIDL.address } as Banking, provider)
}

// This is a helper function to get the program ID for the Banking program depending on the cluster.
export function getBankingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Banking program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return BANKING_PROGRAM_ID
  }
}
