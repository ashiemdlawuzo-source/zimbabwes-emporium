import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { MarketProvider } from '@/lib/market-context';
import { AppProvider } from '@/lib/app-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PiBrowserGate } from '@/components/pi-browser-gate';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://zimbabwe-emporium.bolt.new'),
  title: "Zimbabwe's Emporium — Pi Marketplace",
  description:
    'Buy and sell across Zimbabwe with Pi. From OK Zimbabwe big shops to neighborhood tuckshops and individual sellers. GCV-supported, hub-based escrow delivery.',
  openGraph: {
    title: "Zimbabwe's Emporium — Pi Marketplace",
    description:
      'Buy and sell across Zimbabwe with Pi. GCV-supported, hub-based escrow delivery.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} font-body min-h-screen flex flex-col`}
      >
        <MarketProvider>
          <AppProvider>
            <PiBrowserGate>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </PiBrowserGate>
          </AppProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
