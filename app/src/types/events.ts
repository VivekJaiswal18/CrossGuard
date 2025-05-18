export interface IntentAccount {
  type: 'StopLossTriggered' | 'TakeProfitTriggered' | 'ReinvestTriggered';
  owner: string;
  sourceToken: string;
  targetToken: string;
  amount: number;
  sourceChain: string;
  targetChain: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface BridgeTransaction {
  sourceToken: string;
  targetToken: string;
  amount: number;
  sourceChain: string;
  targetChain: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  error?: string;
}

export interface EventData {
  accountInfo: any;
  context: any;
} 