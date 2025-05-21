"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate } from "@/utils/date" // Import formatDate from a utils file

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample intent history data
const intents = [
  {
    id: "intent-1",
    type: "take-profit",
    token: "ETH",
    targetPrice: 2500,
    executionPercentage: 100,
    destinationChain: "Ethereum",
    destinationToken: "USDC",
    status: "active",
    createdAt: "2025-05-15T10:30:00Z",
  },
  {
    id: "intent-2",
    type: "stop-loss",
    token: "BTC",
    targetPrice: 45000,
    executionPercentage: 50,
    destinationChain: "Solana",
    destinationToken: "USDC",
    status: "active",
    createdAt: "2025-05-14T14:20:00Z",
  },
  {
    id: "intent-3",
    type: "take-profit",
    token: "SOL",
    targetPrice: 120,
    executionPercentage: 75,
    destinationChain: "Ethereum",
    destinationToken: "ETH",
    status: "executed",
    createdAt: "2025-05-10T09:15:00Z",
    executedAt: "2025-05-12T16:45:00Z",
  },
  {
    id: "intent-4",
    type: "stop-loss",
    token: "AVAX",
    targetPrice: 30,
    executionPercentage: 100,
    destinationChain: "Ethereum",
    destinationToken: "USDT",
    status: "cancelled",
    createdAt: "2025-05-08T11:30:00Z",
    cancelledAt: "2025-05-09T13:20:00Z",
  },
  {
    id: "intent-5",
    type: "take-profit",
    token: "MATIC",
    targetPrice: 1.2,
    executionPercentage: 100,
    destinationChain: "Polygon",
    destinationToken: "USDC",
    status: "executed",
    createdAt: "2025-05-05T16:40:00Z",
    executedAt: "2025-05-07T08:10:00Z",
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState("all")

  const filteredIntents = intents.filter((intent) => {
    if (filter === "active") return intent.status === "active"
    if (filter === "executed") return intent.status === "executed"
    if (filter === "cancelled") return intent.status === "cancelled"
    return true
  })

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
            <Link href="/intents" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Set Intents
            </Link>
            <Link href="/history" className="text-sm text-white hover:text-white transition-colors">
              History
            </Link>
          </nav>
        </header>

        <main className="py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-serif mb-12">intent history</h1>

            <div className="space-y-8">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 bg-transparent border border-zinc-800">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-black">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="executed" className="data-[state=active]:bg-white data-[state=active]:text-black">
                    Executed
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-white data-[state=active]:text-black"
                  >
                    Cancelled
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-4">
                    {filteredIntents.length > 0 ? (
                      filteredIntents.map((intent) => <IntentCard key={intent.id} intent={intent} />)
                    ) : (
                      <div className="text-center py-12 text-zinc-500">No intents found</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                  <div className="space-y-4">
                    {filteredIntents.length > 0 ? (
                      filteredIntents.map((intent) => <IntentCard key={intent.id} intent={intent} />)
                    ) : (
                      <div className="text-center py-12 text-zinc-500">No active intents found</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="executed" className="mt-6">
                  <div className="space-y-4">
                    {filteredIntents.length > 0 ? (
                      filteredIntents.map((intent) => <IntentCard key={intent.id} intent={intent} />)
                    ) : (
                      <div className="text-center py-12 text-zinc-500">No executed intents found</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cancelled" className="mt-6">
                  <div className="space-y-4">
                    {filteredIntents.length > 0 ? (
                      filteredIntents.map((intent) => <IntentCard key={intent.id} intent={intent} />)
                    ) : (
                      <div className="text-center py-12 text-zinc-500">No cancelled intents found</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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

interface IntentCardProps {
  intent: {
    id: string
    type: string
    token: string
    targetPrice: number
    executionPercentage: number
    destinationChain: string
    destinationToken: string
    status: string
    createdAt: string
    executedAt?: string
    cancelledAt?: string
  }
}

function IntentCard({ intent }: IntentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-950/20 border-blue-800/30 text-blue-400"
      case "executed":
        return "bg-green-950/20 border-green-800/30 text-green-400"
      case "cancelled":
        return "bg-red-950/20 border-red-800/30 text-red-400"
      default:
        return "bg-zinc-900 border-zinc-800 text-zinc-400"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "take-profit"
      ? "bg-green-950/20 border-green-800/30 text-green-400"
      : "bg-red-950/20 border-red-800/30 text-red-400"
  }

  return (
    <div className="border border-zinc-800 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 border ${getTypeColor(intent.type)}`}>
              {intent.type === "take-profit" ? "Take Profit" : "Stop Loss"}
            </span>
            <span className={`text-xs px-2 py-0.5 border ${getStatusColor(intent.status)}`}>
              {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
            </span>
          </div>
          <h3 className="text-lg font-medium">
            {intent.token} → {intent.destinationToken}
          </h3>
          <p className="text-zinc-400 text-sm">
            {intent.type === "take-profit" ? "Target" : "Stop"} Price: ${intent.targetPrice.toLocaleString()}
          </p>
          <p className="text-zinc-400 text-sm">
            Execution: {intent.executionPercentage}% • Destination: {intent.destinationChain}
          </p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-zinc-500 text-xs">Created: {formatDate(intent.createdAt)}</p>
          {intent.executedAt && <p className="text-green-500 text-xs">Executed: {formatDate(intent.executedAt)}</p>}
          {intent.cancelledAt && <p className="text-red-500 text-xs">Cancelled: {formatDate(intent.cancelledAt)}</p>}
          {intent.status === "active" && (
            <button className="text-xs border border-zinc-800 px-2 py-1 hover:bg-zinc-900 transition-colors mt-2">
              Cancel Intent
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
