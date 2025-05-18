import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { Crossguard } from '../idl/crossguard';
import { BridgeService } from './bridge';

export class EventListenerService {
  private connection: Connection;
  private program: Program<Crossguard>;
  private bridgeService: BridgeService;

  constructor(connection: Connection, program: Program<Crossguard>) {
    this.connection = connection;
    this.program = program;
    this.bridgeService = new BridgeService(connection, program);
  }

  async startListening() {
    try {
      // Subscribe to program account changes
      const subscriptionId = this.connection.onProgramAccountChange(
        this.program.programId,
        async (accountInfo, context) => {
          await this.handleAccountChange(accountInfo, context);
        }
      );

      console.log('Started listening to program events:', subscriptionId);
      return subscriptionId;
    } catch (error) {
      console.error('Error starting event listener:', error);
      throw error;
    }
  }

  private async handleAccountChange(accountInfo: any, context: any) {
    try {
      // Decode the account data
      const data = this.program.coder.accounts.decode(
        'IntentAccount',
        accountInfo.accountInfo.data
      );

      // Handle different event types
      switch (data.type) {
        case 'StopLossTriggered':
          await this.handleStopLoss(data);
          break;
        case 'TakeProfitTriggered':
          await this.handleTakeProfit(data);
          break;
        case 'ReinvestTriggered':
          await this.handleReinvest(data);
          break;
        default:
          console.log('Unknown event type:', data.type);
      }
    } catch (error) {
      console.error('Error handling account change:', error);
    }
  }

  private async handleStopLoss(data: any) {
    console.log('Stop loss triggered:', data);
    // Implement stop loss handling logic
    // This might involve bridging tokens back to the user's wallet
  }

  private async handleTakeProfit(data: any) {
    console.log('Take profit triggered:', data);
    // Implement take profit handling logic
    // This might involve bridging tokens to the user's wallet
  }

  private async handleReinvest(data: any) {
    console.log('Reinvest triggered:', data);
    // Implement reinvest handling logic
    // This might involve bridging tokens to a new position
  }

  async stopListening(subscriptionId: number) {
    try {
      await this.connection.removeProgramAccountChangeListener(subscriptionId);
      console.log('Stopped listening to program events');
    } catch (error) {
      console.error('Error stopping event listener:', error);
      throw error;
    }
  }
} 