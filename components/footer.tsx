'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, MapPin, ShieldCheck, Heart, Eye } from 'lucide-react';
import { incrementVisitorCount, fetchGlobalCount, getStoredCount } from '@/lib/visitor-counter';

export function Footer() {
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    setVisitCount(getStoredCount());
    fetchGlobalCount().then((global) => {
      if (global !== null) setVisitCount(global);
    });
    incrementVisitorCount().then((count) => {
      if (count > 0) setVisitCount(count);
    });
  }, []);

  return (
    <footer className="mt-16 border-t border-border/40 bg-muted/30">
      <div className="h-1 bg-zimbabwe-flag" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-9 h-9 rounded-xl bg-zw-green flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-zw-yellow border-2 border-background" />
              </div>
              <div className="font-heading font-bold">Zimbabwe&rsquo;s Emporium</div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Buy and sell across Zimbabwe with Pi. From big shops to tuckshops to individual sellers — everyone is a shop.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-zw-green transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-zw-green transition-colors">Browse Products</Link></li>
              <li><Link href="/search?gcv=1" className="hover:text-zw-green transition-colors">GCV Products</Link></li>
              <li><Link href="/sell" className="hover:text-zw-green transition-colors">Become a Seller</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Hubs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Harare</li>
              <li className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Bulawayo</li>
              <li className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Mutare</li>
              <li className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Gweru & Masvingo</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Pi & GCV</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-zw-green" /> GCV = $314,159 / 1 π</li>
              <li>Escrow delivery via hubs</li>
              <li>All prices in Pi</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Zimbabwe&rsquo;s Emporium. Built with Pi.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-zw-green flex items-center gap-1.5 tabular-nums">
              <Eye className="h-4 w-4" />
              Total Visits: {visitCount.toLocaleString('en-US')}
            </span>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-zw-green transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-zw-green transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-zw-red fill-zw-red" /> in Zimbabwe
          </p>
        </div>
      </div>
    </footer>
  );
}
