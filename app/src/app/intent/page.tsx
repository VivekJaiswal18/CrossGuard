"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor'
import idl from '@/idl/crossguard.json'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'

const CHAINS = [
  { name: "Solana", id: [1, 0, 0, 0] },
  { name: "Ethereum", id: [69, 0, 0, 0] },
  { name: "Avalanche", id: [6, 0, 0, 0] },
  { name: "Polygon", id: [7, 0, 0, 0] },
  { name: "BNB Chain", id: [8, 0, 0, 0] },
]

const PROGRAM_ID = new PublicKey("BWBZAQvr5i6JPs23sDUzqEVYNC3BqujUEkgnNkpB5Rgn")
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"

const TOP_TOKENS: Record<string, { symbol: string; name: string; mint: string }[]> = {
  Solana: [
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', name: 'USD Coin', mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' },
    { symbol: 'USDT', name: 'Tether', mint: 'BQvGz5b6h1Q6r5Q6r5Q6r5Q6r5Q6r5Q6r5Q6r5Q6r5Q6' },
    { symbol: 'ETH', name: 'Ethereum (Wormhole)', mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs' },
  ],
  Ethereum: [
    { symbol: 'ETH', name: 'Ethereum', mint: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDC', name: 'USD Coin', mint: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'USDT', name: 'Tether', mint: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', mint: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  ],
  'BNB Chain': [
    { symbol: 'BNB', name: 'BNB', mint: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDT', name: 'Tether', mint: '0x55d398326f99059fF775485246999027B3197955' },
    { symbol: 'USDC', name: 'USD Coin', mint: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' },
  ],
  Polygon: [
    { symbol: 'MATIC', name: 'Polygon', mint: '0x0000000000000000000000000000000000001010' },
    { symbol: 'USDC', name: 'USD Coin', mint: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
    { symbol: 'USDT', name: 'Tether', mint: '0x3813e82e6f7098b9583FC0F33a962D02018B6803' },
  ],
  Avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', mint: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
    { symbol: 'USDC', name: 'USD Coin', mint: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
    { symbol: 'USDT', name: 'Tether', mint: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' },
  ],
};

export default function IntentsPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedSourceChain, setSelectedSourceChain] = useState(CHAINS[0])
  const [sourceTokens, setSourceTokens] = useState(TOP_TOKENS[CHAINS[0].name])
  const [selectedToken, setSelectedToken] = useState(TOP_TOKENS[CHAINS[0].name][0])
  const [showSourceChains, setShowSourceChains] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [loopMode, setLoopMode] = useState(false)
  const [intentType, setIntentType] = useState("take-profit")
  const [showChains, setShowChains] = useState(false)
  const [showDestTokens, setShowDestTokens] = useState(false)
  const [targetPrice, setTargetPrice] = useState("")
  const [executionPercentage, setExecutionPercentage] = useState("")
  const [selectedDestChain, setSelectedDestChain] = useState(CHAINS[1])
  const [destTokens, setDestTokens] = useState(TOP_TOKENS[CHAINS[1].name])
  const [selectedDestToken, setSelectedDestToken] = useState(TOP_TOKENS[CHAINS[1].name][0])
  const [reinvestPercentage, setReinvestPercentage] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const { publicKey, signTransaction } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSourceTokens(TOP_TOKENS[selectedSourceChain.name] || [])
    setSelectedToken((TOP_TOKENS[selectedSourceChain.name] || [])[0])
  }, [selectedSourceChain])

  useEffect(() => {
    setDestTokens(TOP_TOKENS[selectedDestChain.name] || [])
    setSelectedDestToken((TOP_TOKENS[selectedDestChain.name] || [])[0])
  }, [selectedDestChain])

  if (!mounted) return null;

  // Helper to get intent id (could be timestamp or random for demo)
  const getIntentId = () => Math.floor(Date.now() / 1000)

  // Handler for Set Intent
  const handleSetIntent = async () => {
    if (!publicKey) {
      setMessage("Please connect your wallet first.")
      return
    }
    if (!targetPrice || !executionPercentage) {
      setMessage("Please fill all required fields.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const connection = new Connection(RPC_URL)
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction } as any,
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      )
      
      // Initialize program with explicit IDL and program ID
      const program = new Program(
        idl as any,
        new PublicKey("BWBZAQvr5i6JPs23sDUzqEVYNC3BqujUEkgnNkpB5Rgn"),
        provider
      );

      const sourceAmount = new BN(1_000_000) // 1 token with 6 decimals
      const targetAmount = new BN(1_000_000) // 1 token with 6 decimals
      const triggerPrice = Math.floor(Number(targetPrice) * 1e6) // price with 6 decimals
      const isTakeProfit = intentType === "take-profit"
      const loopCount = loopMode ? 2 : 0
      const intentId = getIntentId()

      // Only proceed if source and dest chain are Solana (for demo)
      if (selectedSourceChain.name !== 'Solana' || selectedDestChain.name !== 'Solana') {
        setMessage('Cross-chain deposit not yet supported in demo. Use Solana for both chains.')
        setLoading(false)
        return
      }

      // Derive PDAs
      const [intentPda] = await PublicKey.findProgramAddress(
        [Buffer.from('intent'), publicKey.toBuffer(), new BN(intentId).toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );
      const [intentTokenPda] = await PublicKey.findProgramAddress(
        [Buffer.from('intent_token'), publicKey.toBuffer(), new BN(intentId).toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );
      const [vaultTokenPda] = await PublicKey.findProgramAddress(
        [Buffer.from('vault'), intentPda.toBuffer(), new BN(intentId).toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      // Find user's associated token account for the selected token
      const userTokenAccount = getAssociatedTokenAddressSync(
        new PublicKey(selectedToken.mint),
        publicKey
      );

      await program.methods.createIntent(
        new BN(intentId),
        sourceAmount,
        targetAmount,
        new BN(triggerPrice),
        isTakeProfit,
        selectedDestChain.id,
        [0, 0, 0, 0], // target_action placeholder
        loopMode,
        new BN(loopCount)
      ).accounts({
        intent: intentPda,
        state: publicKey, // placeholder, should be the state account
        user: publicKey,
        sourceToken: new PublicKey(selectedToken.mint),
        targetToken: new PublicKey(selectedDestToken.mint),
        userTokenAccount,
        intentTokenAccount: intentTokenPda,
        vaultTokenAccount: vaultTokenPda,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      }).rpc()
      setMessage("Intent set successfully!")
    } catch (err: any) {
      let errorMsg = "Error setting intent: " + err.message;
      // If it's a SendTransactionError, try to get logs
      if (err && typeof err.getLogs === 'function') {
        try {
          const logs = await err.getLogs();
          errorMsg += `\nLogs: ${JSON.stringify(logs)}`;
        } catch (logErr) {
          if (logErr instanceof Error) {
            errorMsg += `\n(Also failed to get logs: ${logErr.message})`;
          } else {
            errorMsg += `\n(Also failed to get logs: Unknown error)`;
          }
        }
      }
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 lg:px-8">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-medium tracking-tight">
            CrossGurard
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/intents" className="text-sm text-white hover:text-white transition-colors">
              Set Intents
            </Link>
            <Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-colors">
              History
            </Link>
          </nav>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </header>

        <main className="py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif mb-12">set your intent</h1>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="source-chain" className="text-zinc-400 text-sm">Source Chain</Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSourceChains(!showSourceChains)}
                      className="w-full flex items-center justify-between bg-transparent border border-zinc-800 p-3 text-left hover:bg-zinc-900 transition-colors"
                    >
                      <span>{selectedSourceChain.name}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </button>
                    {showSourceChains && (
                      <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 max-h-60 overflow-auto">
                        {CHAINS.map((chain) => (
                          <button
                            key={chain.name}
                            className="w-full p-3 hover:bg-zinc-800 text-left"
                            onClick={() => {
                              setSelectedSourceChain(chain)
                              setShowSourceChains(false)
                            }}
                          >
                            {chain.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-zinc-400 text-sm">
                    Select Token
                  </Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowTokens(!showTokens)}
                      className="w-full flex items-center justify-between bg-transparent border border-zinc-800 p-3 text-left hover:bg-zinc-900 transition-colors"
                      disabled={sourceTokens.length === 0}
                    >
                      {selectedToken ? (
                        <>
                          <span>{selectedToken.symbol || 'Unknown'}</span>
                          <span className="text-zinc-500">({selectedToken.name || 'Unknown'})</span>
                        </>
                      ) : (
                        <span className="text-zinc-500">No tokens available</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </button>
                    {showTokens && sourceTokens.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 max-h-60 overflow-auto">
                        {sourceTokens.map(token => (
                          <button
                            key={token.symbol + token.mint}
                            className="w-full flex items-center gap-2 p-3 hover:bg-zinc-800 text-left"
                            onClick={() => {
                              setSelectedToken(token)
                              setShowTokens(false)
                            }}
                          >
                            <span>{token.symbol || 'Unknown'}</span>
                            <span className="text-zinc-500">({token.name || 'Unknown'})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {sourceTokens.length === 0 && (
                    <div className="text-xs text-zinc-500 mt-1">No tokens available for this chain.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Intent Type</Label>
                  <Tabs defaultValue="take-profit" className="w-full">
                    <TabsList className="grid grid-cols-2 bg-transparent">
                      <TabsTrigger
                        value="take-profit"
                        className="border border-green-600 bg-green-950/20 data-[state=active]:bg-green-950/40 data-[state=active]:text-white"
                      >
                        Take Profit
                      </TabsTrigger>
                      <TabsTrigger
                        value="stop-loss"
                        className="border border-red-600 bg-red-950/20 data-[state=active]:bg-red-950/40 data-[state=active]:text-white"
                      >
                        Stop Loss
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="take-profit"
                      className="space-y-4 mt-4 p-4 border border-green-800/30 bg-green-950/10"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="target-price" className="text-zinc-400 text-sm">
                          Target Price (USD)
                        </Label>
                        <Input
                          id="target-price"
                          type="number"
                          placeholder="e.g. 2000.00"
                          className="bg-transparent border-zinc-800 focus-visible:ring-green-500"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="execution-percentage" className="text-zinc-400 text-sm">
                          Execution Percentage
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="execution-percentage"
                            type="number"
                            placeholder="100"
                            className="bg-transparent border-zinc-800 focus-visible:ring-green-500"
                            value={executionPercentage}
                            onChange={(e) => setExecutionPercentage(e.target.value)}
                          />
                          <span className="text-zinc-400">%</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          Percentage of your holdings to sell when target is reached
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="stop-loss"
                      className="space-y-4 mt-4 p-4 border border-red-800/30 bg-red-950/10"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="stop-price" className="text-zinc-400 text-sm">
                          Stop Price (USD)
                        </Label>
                        <Input
                          id="stop-price"
                          type="number"
                          placeholder="e.g. 1500.00"
                          className="bg-transparent border-zinc-800 focus-visible:ring-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="execution-percentage-stop" className="text-zinc-400 text-sm">
                          Execution Percentage
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="execution-percentage-stop"
                            type="number"
                            placeholder="100"
                            className="bg-transparent border-zinc-800 focus-visible:ring-red-500"
                          />
                          <span className="text-zinc-400">%</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          Percentage of your holdings to sell when stop is triggered
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination-chain" className="text-zinc-400 text-sm">
                    Destination Chain
                  </Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowChains(!showChains)}
                      className="w-full flex items-center justify-between bg-transparent border border-zinc-800 p-3 text-left hover:bg-zinc-900 transition-colors"
                    >
                      <span>{selectedDestChain.name}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </button>
                    {showChains && (
                      <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 max-h-60 overflow-auto">
                        {CHAINS.map((chain) => (
                          <button
                            key={chain.name}
                            className="w-full p-3 hover:bg-zinc-800 text-left"
                            onClick={() => {
                              setSelectedDestChain(chain)
                              setShowChains(false)
                            }}
                          >
                            {chain.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination-token" className="text-zinc-400 text-sm">
                    Destination Token
                  </Label>
                  <div className="relative">
                    <button
                      onClick={() => setShowDestTokens(!showDestTokens)}
                      className="w-full flex items-center justify-between bg-transparent border border-zinc-800 p-3 text-left hover:bg-zinc-900 transition-colors"
                      disabled={destTokens.length === 0}
                    >
                      {selectedDestToken ? (
                        <>
                          <span>{selectedDestToken.symbol || 'Unknown'}</span>
                          <span className="text-zinc-500">({selectedDestToken.name || 'Unknown'})</span>
                        </>
                      ) : (
                        <span className="text-zinc-500">No tokens available</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </button>
                    {showDestTokens && destTokens.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 max-h-60 overflow-auto">
                        {destTokens.map(token => (
                          <button
                            key={token.symbol + token.mint}
                            className="w-full flex items-center gap-2 p-3 hover:bg-zinc-800 text-left"
                            onClick={() => {
                              setSelectedDestToken(token)
                              setShowDestTokens(false)
                            }}
                          >
                            <span>{token.symbol || 'Unknown'}</span>
                            <span className="text-zinc-500">({token.name || 'Unknown'})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {destTokens.length === 0 && (
                    <div className="text-xs text-zinc-500 mt-1">No tokens available for this chain.</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="loop-mode" className="text-zinc-400 text-sm">
                      Loop Mode
                    </Label>
                    <p className="text-xs text-zinc-500">Automatically reinvest after execution</p>
                  </div>
                  <input
                    type="checkbox"
                    id="loop-mode"
                    checked={loopMode}
                    onChange={e => setLoopMode(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 mr-2 align-middle"
                  />
                </div>

                {loopMode && (
                  <div className="space-y-2 pt-4 border-t border-zinc-900">
                    <Label htmlFor="reinvest-percentage" className="text-zinc-400 text-sm">
                      Reinvestment Percentage
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="reinvest-percentage"
                        type="number"
                        placeholder="100"
                        className="bg-transparent border-zinc-800 focus-visible:ring-zinc-500"
                      />
                      <span className="text-zinc-400">%</span>
                    </div>
                    <p className="text-xs text-zinc-500">Percentage of proceeds to reinvest</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-4 border border-zinc-800">
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-400 text-sm">Estimated Gas Fee:</span>
                    <span className="text-sm">~0.002 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Wormhole Fee:</span>
                    <span className="text-sm">~0.001 ETH</span>
                  </div>
                </div>
                <Button className="w-full bg-white text-black hover:bg-zinc-200 border-0" onClick={handleSetIntent} disabled={loading}>
                  {loading ? "Setting..." : "Set Intent"}
                </Button>
                {message && <div className="mt-4 text-center text-sm text-red-400">{message}</div>}
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 border-t border-zinc-900">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} CrossGurard</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                privacy policy
              </Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                terms and conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
