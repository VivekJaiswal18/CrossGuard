import axios from 'axios';

export interface MayanToken {
  symbol: string;
  name: string;
  mint?: string; // For Solana
  contract?: string; // For EVM chains
  chainId: number;
  decimals: number;
  chain: string;
}

export async function fetchAllMayanTokens(): Promise<MayanToken[]> {
  const { data } = await axios.get('https://price-api.mayan.finance/v3/tokens');
  return data;
}

// Example usage:
// fetchAllMayanTokens().then(tokens => {
//   tokens.forEach(token => {
//     console.log(token.chain, token.symbol, token.name, token.mint || token.contract, token.chainId);
//   });
// }); 