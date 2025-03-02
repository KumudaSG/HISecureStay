import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Banking } from '../target/types/banking'

describe('banking', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Banking as Program<Banking>

  const bankingKeypair = Keypair.generate()

  it('Initialize Banking', async () => {
    await program.methods
      .initialize()
      .accounts({
        banking: bankingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([bankingKeypair])
      .rpc()

    const currentCount = await program.account.banking.fetch(bankingKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Banking', async () => {
    await program.methods.increment().accounts({ banking: bankingKeypair.publicKey }).rpc()

    const currentCount = await program.account.banking.fetch(bankingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Banking Again', async () => {
    await program.methods.increment().accounts({ banking: bankingKeypair.publicKey }).rpc()

    const currentCount = await program.account.banking.fetch(bankingKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Banking', async () => {
    await program.methods.decrement().accounts({ banking: bankingKeypair.publicKey }).rpc()

    const currentCount = await program.account.banking.fetch(bankingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set banking value', async () => {
    await program.methods.set(42).accounts({ banking: bankingKeypair.publicKey }).rpc()

    const currentCount = await program.account.banking.fetch(bankingKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the banking account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        banking: bankingKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.banking.fetchNullable(bankingKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
