import type React from "react"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/WalletProvider"
import "@solana/wallet-adapter-react-ui/styles.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata = {
  title: "ChainIntent - Cross-Chain Stop Loss & Take Profit Platform",
  description: "Set stop loss and take profit across any blockchain with our Wormhole-powered intent platform.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
