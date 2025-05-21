// 'use client';

// import { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { useProgram } from '../utils/program';
// import { web3, BN } from '@project-serum/anchor';
// import Link from 'next/link';

// export default function Home() {
//   const { publicKey } = useWallet();
//   const { program, provider } = useProgram();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     sourceChain: '',
//     sourceToken: '',
//     targetChain: '',
//     targetToken: '',
//     amount: '',
//     stopLoss: '',
//     takeProfit: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!program || !provider || !publicKey) return;

//     try {
//       setLoading(true);
//       const intentAccount = web3.Keypair.generate();
      
//       const tx = await program.methods
//         .registerIntent(
//           formData.sourceChain,
//           formData.sourceToken,
//           formData.targetChain,
//           formData.targetToken,
//           new BN(formData.amount),
//           new BN(formData.stopLoss),
//           new BN(formData.takeProfit)
//         )
//         .accounts({
//           intent: intentAccount.publicKey,
//           user: publicKey,
//           systemProgram: web3.SystemProgram.programId,
//         })
//         .signers([intentAccount])
//         .rpc();

//       console.log('Transaction successful:', tx);
//       // Reset form
//       setFormData({
//         sourceChain: '',
//         sourceToken: '',
//         targetChain: '',
//         targetToken: '',
//         amount: '',
//         stopLoss: '',
//         takeProfit: '',
//       });
//     } catch (error) {
//       console.error('Error creating intent:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
//       <div className="container mx-auto px-4 py-16">
//         <nav className="flex justify-between items-center mb-16">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
//             CrossGuard
//           </h1>
//           <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
//         </nav>

//         <div className="text-center max-w-4xl mx-auto">
//           <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
//             Cross-Chain DeFi Intent Protocol
//           </h2>
//           <p className="text-xl text-gray-300 mb-12">
//             Set stop loss and take profit intents across chains with ease. Protect your investments and maximize your gains.
//           </p>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
//             <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
//               <h3 className="text-xl font-semibold mb-3 text-purple-400">Cross-Chain</h3>
//               <p className="text-gray-400">Execute intents across different blockchain networks seamlessly</p>
//             </div>
//             <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
//               <h3 className="text-xl font-semibold mb-3 text-purple-400">Stop Loss</h3>
//               <p className="text-gray-400">Protect your investments with automated stop loss orders</p>
//             </div>
//             <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
//               <h3 className="text-xl font-semibold mb-3 text-purple-400">Take Profit</h3>
//               <p className="text-gray-400">Lock in your gains with automated take profit orders</p>
//             </div>
//           </div>

//           <Link 
//             href="/intent"
//             className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
//           >
//             Create Intent
//           </Link>
//         </div>
//       </div>
//     </main>
//   );
// }





import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 lg:px-8">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-medium tracking-tight">CrossGurard</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/intent" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Set Intents
            </Link>
            <Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-colors">
              History
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center">
            <Link
              href="/intent"
              className="text-sm border border-zinc-800 px-4 py-2 hover:bg-zinc-900 transition-colors"
            >
              Launch App
            </Link>
          </div>
        </header>

        <main className="py-16">
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-transparent opacity-30 z-0"></div>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <h1 className="text-6xl md:text-7xl font-serif leading-tight tracking-tight">
                  introducing
                  <br />
                  <span className="text-7xl md:text-8xl">cross chain</span>
                  <br />
                  intents
                </h1>
                <p className="text-xl text-zinc-400 max-w-md">
                CrossGurard is a members-only platform that enables the discerning trader to execute cross-chain
                  intents with precision
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/intent"
                    className="text-sm border border-zinc-800 px-6 py-3 inline-block hover:bg-zinc-900 transition-colors"
                  >
                    Set Intents
                  </Link>
                  <Link
                    href="#features"
                    className="text-sm border border-zinc-800 px-6 py-3 inline-block hover:bg-zinc-900 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <Image
                  src="/images/hero-illustration.png"
                  alt="Cross-chain illustration"
                  width={600}
                  height={400}
                  className="relative z-10"
                />
              </div>
            </div>
          </section>

          <section id="features" className="py-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 to-transparent opacity-30 z-0"></div>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl font-serif">Stop Loss & Take Profit</h2>
                <p className="text-zinc-400">
                  Set your trading parameters once and let our platform execute your intents across any blockchain.
                  Precision trading without constant monitoring.
                </p>
                <div>
                  <Link
                    href="/intent"
                    className="text-sm border border-zinc-800 px-4 py-2 inline-block hover:bg-zinc-900 transition-colors"
                  >
                    Set Intents
                  </Link>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-serif">Cross-Chain Execution</h2>
                <p className="text-zinc-400">
                  Powered by Wormhole, our platform enables seamless trading across multiple blockchains with a single
                  intent. No more managing multiple wallets.
                </p>
                <div>
                  <Link
                    href="#"
                    className="text-sm border border-zinc-800 px-4 py-2 inline-block hover:bg-zinc-900 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="py-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 to-transparent opacity-30 z-0"></div>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  <Image
                    src="/images/chain-illustration.png"
                    alt="Chain illustration"
                    width={600}
                    height={400}
                    className="relative z-10"
                  />
                </div>
              </div>
              <div className="space-y-8 order-1 md:order-2">
                <h2 className="text-5xl font-serif leading-tight">seamless execution across blockchains</h2>
                <p className="text-zinc-400">
                  Our platform leverages Wormhole's cross-chain messaging protocol to execute your trading intents
                  across any supported blockchain. Set your parameters once and let our system handle the rest.
                </p>
                <ul className="space-y-4">
                  {[
                    "Ethereum, Solana, Avalanche, and more",
                    "Gas-optimized execution",
                    "Secure, non-custodial operation",
                    "Real-time monitoring and notifications",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span className="text-zinc-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="py-32 border-t border-zinc-900">
            <div className="max-w-4xl mx-auto space-y-12">
              <h2 className="text-4xl font-serif">complete security. no asterisks.</h2>
              <div className="grid md:grid-cols-2 gap-16">
                <div>
                  <p className="text-zinc-400">
                  CrossGurard encrypts all data and transactions to ensure a completely secure experience for our
                    members.
                  </p>
                </div>
                <div>
                  <Image
                    src="/images/security-badges.png"
                    alt="Security certifications"
                    width={400}
                    height={100}
                    className="opacity-80"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-16 border-t border-zinc-900">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm text-zinc-500">Platform</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Security
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Roadmap
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm text-zinc-500">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Terms and conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Disclosures
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm text-zinc-500">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Community
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm text-zinc-500">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <p className="text-sm text-zinc-500">© {new Date().getFullYear()} CrossGurard Technologies Pvt Ltd.</p>
              <div className="flex gap-8">
                <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  privacy policy
                </Link>
                <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  terms and conditions
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
