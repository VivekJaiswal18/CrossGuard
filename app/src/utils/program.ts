import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { IDL } from '../idl/crossguard';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Program ID from Anchor.toml
const PROGRAM_ID = new web3.PublicKey('6FWQ5mNaGKLx4jfGa7TEU5RUsmmKCS3sF6BafXTxdvSN');

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  return { program, provider };
};

export const createIntent = async (
  program: Program,
  provider: AnchorProvider,
  params: {
    sourceChain: string;
    sourceToken: string;
    targetChain: string;
    targetToken: string;
    amount: number;
    stopLoss: number;
    takeProfit: number;
  }
) => {
  try {
    const intentAccount = web3.Keypair.generate();
    
    const tx = await program.methods
      .registerIntent(
        params.sourceChain,
        params.sourceToken,
        params.targetChain,
        params.targetToken,
        new BN(params.amount),
        new BN(params.stopLoss),
        new BN(params.takeProfit)
      )
      .accounts({
        intent: intentAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([intentAccount])
      .rpc();

    return { tx, intentAccount: intentAccount.publicKey };
  } catch (error) {
    console.error('Error creating intent:', error);
    throw error;
  }
};

export const cancelIntent = async (
  program: Program,
  provider: AnchorProvider,
  intentAddress: web3.PublicKey
) => {
  try {
    const tx = await program.methods
      .cancelIntent()
      .accounts({
        intent: intentAddress,
        user: provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  } catch (error) {
    console.error('Error canceling intent:', error);
    throw error;
  }
}; 