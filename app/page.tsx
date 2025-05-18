import Link from 'next/link';
import WalletButton from './wallet-button';

<div className="max-w-xl w-full px-6 py-12 rounded-3xl shadow-2xl bg-black/60 flex flex-col items-center">
  <h1 className="text-4xl font-extrabold mb-4 tracking-tight">CrossGuard</h1>
  <p className="text-lg text-gray-300 mb-8 text-center">
    The next-gen cross-chain DeFi protocol for automated stop loss, take profit, and continuous strategies.<br />
    Powered by Solana, Pyth, and Mayan Swift.
  </p>
  <WalletButton />
  <Link
    href="/intent"
    className="px-8 py-3 mt-6 bg-gradient-to-r from-[#00e0d3] to-[#0077ff] rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition"
  >
    Set Your Intent
  </Link>
</div> 