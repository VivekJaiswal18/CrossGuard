export const MAYAN_CONFIG = {
  // Mayan Swift API configuration
  apiKey: process.env.MAYAN_API_KEY || '',
  apiUrl: process.env.MAYAN_API_URL || 'https://api.mayan.finance',
  
  // Supported chains
  supportedChains: {
    solana: {
      id: 'solana',
      name: 'Solana',
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    },
    ethereum: {
      id: 'ethereum',
      name: 'Ethereum',
      rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
    },
    // Add more chains as needed
  },

  // Token configurations
  tokens: {
    // Add your token configurations here
    // Example:
    // 'SOL': {
    //   address: 'So11111111111111111111111111111111111111112',
    //   decimals: 9,
    // },
  },

  // Bridge configuration
  bridge: {
    minAmount: 0.1, // Minimum amount for bridging
    maxAmount: 1000, // Maximum amount for bridging
    feePercentage: 0.1, // Bridge fee percentage
  },
}; 