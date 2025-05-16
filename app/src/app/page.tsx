'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProgram } from '../utils/program';
import { web3, BN } from '@project-serum/anchor';

export default function Home() {
  const { publicKey } = useWallet();
  const { program, provider } = useProgram();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceChain: '',
    sourceToken: '',
    targetChain: '',
    targetToken: '',
    amount: '',
    stopLoss: '',
    takeProfit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !provider || !publicKey) return;

    try {
      setLoading(true);
      const intentAccount = web3.Keypair.generate();
      
      const tx = await program.methods
        .registerIntent(
          formData.sourceChain,
          formData.sourceToken,
          formData.targetChain,
          formData.targetToken,
          new BN(formData.amount),
          new BN(formData.stopLoss),
          new BN(formData.takeProfit)
        )
        .accounts({
          intent: intentAccount.publicKey,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([intentAccount])
        .rpc();

      console.log('Transaction successful:', tx);
      // Reset form
      setFormData({
        sourceChain: '',
        sourceToken: '',
        targetChain: '',
        targetToken: '',
        amount: '',
        stopLoss: '',
        takeProfit: '',
      });
    } catch (error) {
      console.error('Error creating intent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">CrossGuard</h1>
          <WalletMultiButton />
        </div>

        {publicKey ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Chain</label>
                <input
                  type="text"
                  name="sourceChain"
                  value={formData.sourceChain}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source Token</label>
                <input
                  type="text"
                  name="sourceToken"
                  value={formData.sourceToken}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Chain</label>
                <input
                  type="text"
                  name="targetChain"
                  value={formData.targetChain}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Token</label>
                <input
                  type="text"
                  name="targetToken"
                  value={formData.targetToken}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stop Loss</label>
                <input
                  type="number"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Take Profit</label>
                <input
                  type="number"
                  name="takeProfit"
                  value={formData.takeProfit}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Intent'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Connect your wallet to get started</h2>
            <p className="text-gray-600">Use the button above to connect your Solana wallet</p>
          </div>
        )}
      </div>
    </main>
  );
}
