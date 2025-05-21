# Project Description

Crossguard is an intent-based cross-chain Stop Loss (SL) / Take Profit (TP) protocol that enables users to secure profits or prevent losses on any token they hold — across chains — without actively monitoring the market.

Users define their SL/TP intents (e.g., “Sell my $SOL if price drops below $120”, “Sell my Trump Coin if price drops below $20”) through an intuitive UI. These intents are stored on-chain and monitored by the smart contract, and once conditions are met the smart contract triggers an event to the backend which executes a cross-chain swap or transfer using Mayan Swift, with transaction settlement via Wormhole Settlement Layer.

This creates a non-custodial, decentralized safety net for crypto traders and DeFi users across ecosystems — ideal for volatile markets or passive portfolio management.

Not only this but CrossGuard offers a first of its kind `Loop Mode` option to the users, which when enabled, keeps the loop for maintaining the intent till the user withdraws the tokens for maintaing the value of the asset on chain even if it has to be bridged to other chains.

## Key Features

* Intent-based SL/TP execution (no active user intervention needed)

* Cross-chain execution using Mayan Swift

* Integrated with Wormhole Settlement for transfer reliability

* Non-custodial: Users keep full control until execution

* Pyth oracles used for real-time on-chain price feeds

* Optional escrow of funds for guaranteed execution

* Event-emitting smart contract for indexers and automation

## Architecture Overview

Frontend: Built with Next.js & deployed on Vercel

Backend Listener / Executor: Hosted on Railway, monitors price feed and triggers SL/TP execution

Solana Smart Contract: Built using Anchor to register and manage user intents

Bridging & Execution: Powered by Mayan Swift SDK

Settlement Layer: Uses Wormhole’s Settlement Protocol for secure finality

Price Oracle: Real-time feeds from Pyth Network

## Resources & Integrations

Wormhole Settlement Docs: https://wormhole.com/docs/learn/transfers/settlement/

Mayan Swift SDK: https://docs.mayan.finance/architecture/swift

Mayan Swift Demo: https://github.com/wormhole-foundation/demo-mayanswift

Pyth Price Feeds: https://docs.pyth.network/

Anchor Framework (Solana Smart Contracts): https://book.anchor-lang.com/

## Why It Matters

* Helps traders automate risk management cross-chain.

* Reduces emotional and reactive trading.

* Solves a massive gap in DeFi tooling: passive execution automation across chains.

* Opens the door for protocol integrations (DEXs, vaults, wallets, etc.)

## Getting Started

First, intall all the dependencies for the frontend by running the command in the `app dir`:

```
npm install
```
Then, run the development server:

```bash
npm run dev
```