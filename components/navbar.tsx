'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Menu,
  Search,
  Store,
  Home as HomeIcon,
  ShieldCheck,
  ShoppingCart,
  User,
  Package,
  Loader2,
  LogOut,
  MapPin,
  Briefcase,
  Heart,
  BarChart3,
  Network,
  CloudUpload,
  Compass,
  X,
} from 'lucide-react';
import { useMarket } from '@/lib/market-context';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

const primaryLinks = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/search', label: 'Browse', icon: Search },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
];

const navLinks = [
  ...primaryLinks,
  { href: '/hubs', label: 'Hubs', icon: MapPin },
  { href: '/sell', label: 'Sell', icon: Store },
  { href: '/sell/upload', label: 'Upload', icon: CloudUpload },
];

type DrawerSection = {
  title: string;
  items: { href: string; label: string; icon: typeof HomeIcon; badge?: number }[];
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { gcvOnly, setGcvOnly, ready } = useMarket();
  const { cartCount, piUser, piLoading, piAuthenticating, authenticatePi } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const handleAvatarClick = () => {
    if (piUser) {
      setDrawerOpen(true);
    } else {
      authenticatePi();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ze_pi_user');
    setDrawerOpen(false);
    window.location.reload();
  };

  const drawerSections: DrawerSection[] = [
    {
      title: 'SHOP',
      items: [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/search', label: 'Browse', icon: Compass },
        { href: '/jobs', label: 'Jobs Board', icon: Briefcase },
        { href: '/hubs', label: 'Hubs Nearby', icon: MapPin },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { href: '/orders', label: 'My Orders', icon: Package },
        { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
        { href: '/search', label: 'Wishlist', icon: Heart },
      ],
    },
    {
      title: 'SELLING',
      items: [
        { href: '/seller/orders', label: 'Seller Dashboard', icon: BarChart3 },
        { href: '/hub/dashboard', label: 'Hub Dashboard', icon: Network },
        { href: '/sell/upload', label: 'Upload Product', icon: CloudUpload },
        { href: '/admin/disputes', label: 'Dispute Resolution', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
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

              {/* Avatar / Profile */}
              <button
                onClick={handleAvatarClick}
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

              {/* My Orders quick link (desktop) */}
              <Link
                href="/orders"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-zw-green hover:bg-muted transition-colors"
              >
                <Package className="h-4 w-4" /> Orders
              </Link>

              {/* Mobile menu button - hamburger only */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>


        </div>
      </header>

      {/* Mobile slide-in drawer */}
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-[70] h-full w-[85%] max-w-sm bg-background rounded-l-3xl shadow-2xl transition-transform duration-300 lg:hidden flex flex-col',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            {piUser ? (
              <div className="w-10 h-10 rounded-full bg-zw-green text-white text-sm font-bold flex items-center justify-center">
                {piUser.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-bold text-sm">
                {piUser ? piUser.username : 'Guest'}
              </div>
              {piUser ? (
                <div className="text-xs text-zw-green-700 font-medium flex items-center gap-1">
                  <span className="text-zw-green">π</span> Signed in with Pi
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Not signed in</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {piLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {drawerSections.map((section, sIdx) => (
                <div key={section.title}>
                  <div className="text-xs font-bold text-zw-green-700 tracking-wide pt-4 pb-2 px-1">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            'flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-colors',
                            active
                              ? 'text-zw-green bg-zw-green-50'
                              : 'text-foreground hover:bg-green-50'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-zw-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  {sIdx < drawerSections.length - 1 && (
                    <div className="border-t border-border/30 my-3" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Sticky bottom actions */}
        <div className="border-t border-border/40 p-4 space-y-2 bg-background">
          {piUser ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-zw-red hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
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
          <Link href="/sell" onClick={() => setDrawerOpen(false)}>
            <Button className="w-full bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11">
              Start Selling
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
