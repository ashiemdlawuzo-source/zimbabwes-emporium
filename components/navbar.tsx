'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Menu,
  Search,
  Store,
  Upload,
  Home as HomeIcon,
  X,
  ShieldCheck,
  ShoppingCart,
  User,
  Package,
  Loader2,
  LogOut,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useMarket } from '@/lib/market-context';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const primaryLinks = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/search', label: 'Browse', icon: Search },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
];

const navLinks = [
  ...primaryLinks,
  { href: '/hubs', label: 'Hubs', icon: MapPin },
  { href: '/sell', label: 'Sell', icon: Store },
  { href: '/sell/upload', label: 'Upload', icon: Upload },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { gcvOnly, setGcvOnly, ready } = useMarket();
  const { cartCount, piUser, piLoading, piAuthenticating, authenticatePi } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    setMobileOpen(false);
  };

  const handleProfileClick = async () => {
    if (piUser) {
      setProfileOpen((v) => !v);
    } else {
      await authenticatePi();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ze_pi_user');
    window.location.reload();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-lg shadow-sm border-b border-border/40'
          : 'bg-background'
      )}
    >
      {/* Flag strip */}
      <div className="h-1 bg-zimbabwe-flag" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative w-9 h-9 rounded-xl bg-zw-green flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-zw-yellow border-2 border-background" />
            </div>
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-base leading-none">
                Zimbabwe&rsquo;s Emporium
              </div>
              <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Pi Marketplace
              </div>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products, shops, hubs…"
                className="pl-9 pr-4 h-10 rounded-full bg-muted/50 border-0 focus-visible:ring-zw-green"
              />
            </div>
          </form>

          {/* GCV toggle (desktop) */}
          {ready && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green-50 border border-zw-green/20">
              <Switch
                checked={gcvOnly}
                onCheckedChange={setGcvOnly}
                className="data-[state=checked]:bg-zw-green"
              />
              <div className="flex items-center gap-1 text-xs font-medium text-zw-green-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {gcvOnly ? 'GCV Only' : 'Show GCV Only'}
              </div>
            </div>
          )}

          {/* Nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-zw-green bg-zw-green-50'
                      : 'text-foreground/70 hover:text-zw-green hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-zw-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Profile"
              >
                {piAuthenticating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : piUser ? (
                  <div className="w-6 h-6 rounded-full bg-zw-green text-white text-xs font-bold flex items-center justify-center">
                    {piUser.username.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
              {profileOpen && piUser && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border/60 rounded-xl shadow-lg py-2 animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-border/40">
                    <div className="text-sm font-semibold">{piUser.username}</div>
                    <div className="text-xs text-muted-foreground">Signed in with Pi</div>
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link
                    href="/seller/orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Store className="h-4 w-4" /> Seller Dashboard
                  </Link>
                  <Link
                    href="/hub/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <MapPin className="h-4 w-4" /> Hub Dashboard
                  </Link>
                  <Link
                    href="/admin/disputes"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" /> Dispute Resolution
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zw-red hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* My Orders quick link (desktop) */}
            <Link
              href="/orders"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-zw-green hover:bg-muted transition-colors"
            >
              <Package className="h-4 w-4" /> Orders
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Always-visible primary links (mobile + tablet) */}
        <nav className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {primaryLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'text-zw-green bg-zw-green-50'
                    : 'text-foreground/70 hover:text-zw-green hover:bg-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products…"
                  className="pl-9 h-10 rounded-full bg-muted/50 border-0"
                />
              </div>
            </form>

            {ready && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zw-green-50 border border-zw-green/20">
                <div className="flex items-center gap-2 text-sm font-medium text-zw-green-700">
                  <ShieldCheck className="h-4 w-4" />
                  Show GCV Only
                </div>
                <Switch
                  checked={gcvOnly}
                  onCheckedChange={setGcvOnly}
                  className="data-[state=checked]:bg-zw-green"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {navLinks.filter(l => !primaryLinks.includes(l)).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'text-zw-green bg-zw-green-50'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <Link href="/cart" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full rounded-full h-11 justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({cartCount})
              </Button>
            </Link>
            <Link href="/orders" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full rounded-full h-11 justify-start">
                <Package className="h-4 w-4 mr-2" /> My Orders
              </Button>
            </Link>
            <Link href="/seller/orders" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full rounded-full h-11 justify-start">
                <Store className="h-4 w-4 mr-2" /> Seller Dashboard
              </Button>
            </Link>

            {piLoading ? (
              <div className="text-center text-sm text-muted-foreground py-2">
                Loading Pi…
              </div>
            ) : piUser ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                <div className="w-8 h-8 rounded-full bg-zw-green text-white text-xs font-bold flex items-center justify-center">
                  {piUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{piUser.username}</span>
              </div>
            ) : (
              <Button
                onClick={async () => { await authenticatePi(); }}
                disabled={piAuthenticating}
                className="w-full bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11"
              >
                {piAuthenticating ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Signing in…</>
                ) : (
                  <><User className="h-4 w-4 mr-1.5" /> Login with Pi</>
                )}
              </Button>
            )}

            <Link href="/sell" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
