import React from 'react';
"use client";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletButton() {
  // The button is already styled by wallet-adapter, but you can add custom classes if needed
  return (
    <div className="flex justify-center mb-4">
      <WalletMultiButton className="!bg-gradient-to-r !from-[#00e0d3] !to-[#0077ff] !rounded-full !text-lg !font-semibold !shadow-lg !px-6 !py-2 !hover:scale-105 !transition" />
    </div>
  );
} 