import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { Crossguard } from '../idl/crossguard';
// import { ChainId } from '../types/bridge';
import {
  fetchTokenList,
  fetchQuote,
  swapFromSolana,
  type QuoteParams,
  type Quote,
  type SolanaTransactionSigner,
} from '@mayanfinance/swap-sdk';

export class BridgeService {
  private connection: Connection;
  private program: Program<Crossguard>;

  constructor(connection: Connection, program: Program<Crossguard>) {
    this.connection = connection;
    this.program = program;
  }

  // Get supported tokens for a chain
  async getSupportedTokens(chain: string) {
    // chain should be one of: 'solana', 'ethereum', 'bsc', 'polygon', 'avalanche', 'aptos'
    return await fetchTokenList(chain as any);
  }

  // Get quote for a cross-chain swap
  async fetchQuote(params: QuoteParams): Promise<Quote> {
    return await fetchQuote(params);
  }

  // Perform the cross-chain swap from Solana
  async bridgeTokensFromSolana({
    quote,
    swapperWalletAddress,
    destinationAddress,
    timeout,
    signTransaction,
  }: {
    quote: Quote;
    swapperWalletAddress: string;
    destinationAddress: string;
    timeout: number;
    signTransaction: (trx: any) => Promise<any>;
  }) {
    // Use Mayan SDK to perform the swap from Solana
    return await swapFromSolana(
      quote,
      swapperWalletAddress,
      destinationAddress,
      timeout,
      signTransaction
    );
  }
} 