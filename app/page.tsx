'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMarket } from '@/lib/market-context';
import { incrementVisitorCount } from '@/lib/visitor-counter';
import { ProductCard } from '@/components/product-card';
import { GcvBadge } from '@/components/gcv-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HUBS, SHOP_TYPE_FILTERS, ShopType, RegisteredHub, MARKET_CATEGORIES } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import {
  Search,
  MapPin,
  ShieldCheck,
  Store,
  User,
  ArrowRight,
  Package,
  HandCoins,
  Truck,
  CircleCheck,
  Sparkles,
  TrendingUp,
  Plus,
  Building2,
  Clock,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { quotes } from '@/lib/quotes';
import { QuoteCard } from '@/components/quote-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { ready, products, sellers, gcvOnly } = useMarket();
  const { registeredHubs } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    incrementVisitorCount();
  }, []);

  const featuredProducts = useMemo(() => {
    let list = [...products].sort((a, b) => b.createdAt - a.createdAt);
    if (gcvOnly) list = list.filter((p) => p.gcvSupported);
    if (activeCategory !== 'all') list = list.filter((p) => p.category === activeCategory);
    return list.slice(0, 8);
  }, [products, gcvOnly, activeCategory]);

  const sellerMap = useMemo(() => {
    const m = new Map(sellers.map((s) => [s.id, s]));
    return m;
  }, [sellers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const allHubs = useMemo(() => {
    const staticHubs = HUBS.map((h) => ({ ...h, status: 'approved' as const, city: h.name, feePi: 0, address: '', phone: '', whatsapp: '', description: h.description, createdAt: 0, id: h.id, name: h.name, hubType: 'country' as const, isCountryWide: true }));
    const dynamic: RegisteredHub[] = registeredHubs.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      address: h.address,
      phone: h.phone,
      whatsapp: h.whatsapp,
      description: h.description,
      feePi: h.feePi,
      status: h.status,
      createdAt: h.createdAt,
      hubType: h.hubType ?? 'country',
    }));
    return [...staticHubs, ...dynamic];
  }, [registeredHubs]);

  const countryHubCount = allHubs.filter((h) => (h.hubType ?? 'country') === 'country').length;
  const villageHubCount = allHubs.filter((h) => h.hubType === 'local').length;
  const provincesCovered = useMemo(() => {
    const provs = new Set<string>();
    registeredHubs.forEach((h) => {
      if (h.isCountryWide) provs.add('Zimbabwe-wide');
      h.provincesCovered?.forEach((p) => provs.add(p));
      if (h.province) provs.add(h.province);
    });
    return provs.size;
  }, [registeredHubs]);

  const pendingHubs = allHubs.filter((h) => h.status === 'pending');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zw-green-50 via-background to-zw-yellow-50">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg%22%3E%3Cpath d=\\"M30 0L0 30L30 60L60 30z\\" fill=\\"%23009739\\"/%3E%3C/svg%3E")',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green/10 text-zw-green text-sm font-medium mb-5">
                <Sparkles className="h-4 w-4" />
                Everyone is a shop
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-balance">
                From Tomatoes to Televisions —{' '}
                <span className="text-zw-green">pay with Pi</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-lg text-balance">
                From OK Zimbabwe big shops to your neighborhood tuckshop to Amai selling from home — buy fresh produce, electronics, appliances, and more with Pi across the nation.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="mt-7 flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tomatoes, fabric, maize meal…"
                    className="pl-11 h-12 rounded-full bg-background shadow-sm border-border/60 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-full bg-zw-green hover:bg-zw-green-600 text-white text-base font-semibold"
                >
                  Search
                </Button>
              </form>

              {/* Jobs banner */}
              <Link
                href="/jobs"
                className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zw-green/10 border border-zw-green/20 hover:bg-zw-green/15 hover:border-zw-green/30 transition-all group max-w-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-zw-green flex items-center justify-center shrink-0">
                  <Briefcase className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-zw-green-800">
                    Looking for work? Visit Jobs Board
                  </div>
                  <div className="text-xs text-zw-green-700/80">
                    2 hiring now
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zw-green group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                <div>
                  <div className="text-2xl font-bold font-heading text-zw-green">
                    {ready ? products.length : '\u2014'}
                  </div>
                  <div className="text-xs text-muted-foreground">Products listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-heading text-zw-yellow-600">
                    {ready ? sellers.length : '\u2014'}
                  </div>
                  <div className="text-xs text-muted-foreground">Active shops</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-heading text-zw-red">
                    {countryHubCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Country hubs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-heading text-zw-yellow-600">
                    {villageHubCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Village hubs</div>
                </div>
              </div>
            </div>

            {/* Hero image collage */}
            <div className="hidden lg:block relative animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg animate-float">
                    <Image
                      src="https://images.pexels.com/photos/15170758/pexels-photo-15170758.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="Fresh produce market"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.pexels.com/photos/8655023/pexels-photo-8655023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="African fabrics"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-6">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.pexels.com/photos/20362433/pexels-photo-20362433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="Handicrafts"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
                    <Image
                      src="https://images.pexels.com/photos/33624058/pexels-photo-33624058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="Fresh vegetables"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                </div>
              </div>
              {/* GCV floating badge */}
              <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-zw-green flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold">GCV Verified</div>
                  <div className="text-xs text-muted-foreground">$314,159 = 1 π</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop types - CLICKABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {SHOP_TYPE_FILTERS.map((item, i) => {
            const Icon = item.value === 'big_shop' ? Store : item.value === 'tuckshop' ? Store : User;
            const colorClass = item.value === 'big_shop' ? 'zw-green' : item.value === 'tuckshop' ? 'zw-yellow' : 'zw-red';
            return (
              <Link
                key={item.value}
                href={`/search?type=${item.value}`}
                className="group"
              >
                <Card
                  className="p-5 flex items-start gap-4 border-border/60 hover:shadow-lg hover:border-zw-green/30 hover:-translate-y-1 transition-all cursor-pointer animate-fade-up h-full"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    colorClass === 'zw-green' && 'bg-zw-green-50 text-zw-green group-hover:bg-zw-green group-hover:text-white',
                    colorClass === 'zw-yellow' && 'bg-zw-yellow-50 text-zw-yellow-600 group-hover:bg-zw-yellow-500 group-hover:text-white',
                    colorClass === 'zw-red' && 'bg-zw-red-50 text-zw-red group-hover:bg-zw-red group-hover:text-white',
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.value === 'big_shop' && 'OK Zimbabwe and established retailers'}
                      {item.value === 'tuckshop' && 'Neighborhood corner stores'}
                      {item.value === 'individual' && 'Selling directly — like Amai'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-zw-green font-medium mt-2 group-hover:gap-2 transition-all">
                      Browse <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Delivery Hubs</h2>
            <p className="text-muted-foreground mt-1">
              We have {countryHubCount} Country Hub{countryHubCount !== 1 ? 's' : ''} and {villageHubCount} Village Hub{villageHubCount !== 1 ? 's' : ''} covering {provincesCovered} province{provincesCovered !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/hubs">
              <Button variant="ghost" className="text-zw-green hover:text-zw-green-700 hover:bg-zw-green-50 rounded-full">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {HUBS.map((hub, i) => (
            <Link
              key={hub.id}
              href={`/search?hub=${hub.id}`}
              className="group"
            >
              <Card
                className="p-4 h-full border-border/60 hover:border-zw-green/40 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-zw-green-50 flex items-center justify-center mb-3 group-hover:bg-zw-green group-hover:text-white transition-colors">
                  <MapPin className="h-5 w-5 text-zw-green group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-base">{hub.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{hub.region}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{hub.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pending hubs */}
        {pendingHubs.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-zw-yellow-600" />
              <span className="text-sm font-medium text-zw-yellow-600">Pending Approval</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {pendingHubs.map((hub) => (
                <Card key={hub.id} className="p-4 border-zw-yellow/30 bg-zw-yellow-50/30">
                  <div className="w-10 h-10 rounded-full bg-zw-yellow-50 flex items-center justify-center mb-3">
                    <MapPin className="h-5 w-5 text-zw-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-base">{hub.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{hub.city}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-zw-yellow/20 text-zw-yellow-700 font-medium">
                    Pending Approval
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Become a Hub CTA */}
        <div className="mt-6">
          <Link href="/hub/register">
            <Card className="p-5 border-2 border-dashed border-zw-green/30 hover:border-zw-green/60 hover:bg-zw-green-50/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zw-green/10 flex items-center justify-center shrink-0 group-hover:bg-zw-green group-hover:text-white transition-colors">
                  <Plus className="h-6 w-6 text-zw-green group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zw-green">Become a Delivery Hub</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Register your location as an escrow delivery point and earn Pi per delivery.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zw-green ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-zw-green mb-1">
              <TrendingUp className="h-4 w-4" />
              Fresh listings
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Featured Products</h2>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="text-zw-green hover:text-zw-green-700 hover:bg-zw-green-50 rounded-full">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium border transition-all',
              activeCategory === 'all'
                ? 'bg-zw-green text-white border-zw-green'
                : 'border-border/60 hover:border-zw-green/30'
            )}
          >
            All
          </button>
          {MARKET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                activeCategory === cat
                  ? 'bg-zw-green text-white border-zw-green'
                  : 'border-border/60 hover:border-zw-green/30'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {ready ? (
          featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  seller={sellerMap.get(product.sellerId)}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products yet. Be the first to list!</p>
              <Link href="/sell/upload" className="mt-4 inline-block">
                <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full">
                  Upload a Product
                </Button>
              </Link>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border/40 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-2">How It Works</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            Buy and sell safely with Pi and hub-based escrow delivery.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: User, title: '1. Register your shop', desc: 'Anyone can sell — big shop, tuckshop, or individual.' },
              { icon: Package, title: '2. List your products', desc: 'Upload a photo, set your Pi price, choose your hub.' },
              { icon: HandCoins, title: '3. Buyer pays in Pi', desc: 'GCV-supported products carry the green badge of trust.' },
              { icon: Truck, title: '4. Escrow delivery', desc: 'Pick up or deliver via your nearest hub — safe and secure.' },
            ].map((step, i) => (
              <div
                key={step.title}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-background border border-border/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <step.icon className="h-7 w-7 text-zw-green" />
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GCV callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-zw-green to-zw-green-600">
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-heading text-2xl font-bold mb-1">GCV Supported</h2>
              <p className="text-white/90">
                The Global Consensus Value pegs 1 Pi at $314,159. Look for the green GCV badge on products and filter with &ldquo;Show GCV Only&rdquo; to shop with confidence.
              </p>
            </div>
            <Link href="/search?gcv=1">
              <Button className="bg-white text-zw-green hover:bg-white/90 rounded-full h-11 px-6 font-semibold">
                Browse GCV Products
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Founder quotes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-zw-green text-center mb-8">
          Words from the Founder
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${quoteIndex * 100}%)` }}
            >
              {quotes.map((q, i) => (
                <div key={i} className="w-full shrink-0 px-1">
                  <QuoteCard text={q.text} author={q.author} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrow buttons */}
          <button
            onClick={() => setQuoteIndex((quoteIndex - 1 + quotes.length) % quotes.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-zw-green hover:bg-zw-green hover:text-white transition-colors z-10"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setQuoteIndex((quoteIndex + 1) % quotes.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-zw-green hover:bg-zw-green hover:text-white transition-colors z-10"
            aria-label="Next quote"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setQuoteIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === quoteIndex ? 'w-6 bg-zw-green' : 'w-2 bg-zw-green/30 hover:bg-zw-green/50'
              )}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl bg-zw-black text-white p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-zimbabwe-flag" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            Ready to start selling?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-6">
            Whether you&rsquo;re OK Zimbabwe, a tuckshop on the corner, or Amai selling tomatoes from home — everyone is a shop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sell">
              <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-12 px-8 text-base font-semibold">
                Register Your Shop
              </Button>
            </Link>
            <Link href="/sell/upload">
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white rounded-full h-12 px-8 text-base">
                Upload a Product
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
