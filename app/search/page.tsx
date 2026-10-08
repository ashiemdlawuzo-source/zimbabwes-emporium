'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarket } from '@/lib/market-context';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HUBS, CATEGORIES, SHOP_TYPE_FILTERS, ShopType } from '@/lib/types';
import {
  Search,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  X,
  Package,
  Store,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const { products, sellers, gcvOnly, setGcvOnly, ready } = useMarket();

  const query = searchParams.get('q') ?? '';
  const hubFilter = searchParams.get('hub') ?? '';
  const gcvParam = searchParams.get('gcv') === '1';
  const typeParam = searchParams.get('type') ?? '';

  const [search, setSearch] = useState(query);
  const [selectedHub, setSelectedHub] = useState(hubFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [showGcvOnly, setShowGcvOnly] = useState(gcvParam || gcvOnly);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearch(query);
    setSelectedHub(hubFilter);
    setSelectedType(typeParam);
    if (gcvParam) setShowGcvOnly(true);
  }, [query, hubFilter, gcvParam, typeParam]);

  const sellerMap = useMemo(() => new Map(sellers.map((s) => [s.id, s])), [sellers]);

  const filtered = useMemo(() => {
    let list = [...products].sort((a, b) => b.createdAt - a.createdAt);
    if (showGcvOnly || gcvOnly) list = list.filter((p) => p.gcvSupported);
    if (selectedHub) list = list.filter((p) => p.hub === selectedHub);
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    if (selectedType) {
      list = list.filter((p) => {
        const seller = sellerMap.get(p.sellerId);
        return seller?.type === selectedType;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.hub.toLowerCase().includes(q) ||
          sellerMap.get(p.sellerId)?.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, showGcvOnly, gcvOnly, selectedHub, selectedCategory, selectedType, search, sellerMap]);

  const clearFilters = () => {
    setSearch('');
    setSelectedHub('');
    setSelectedCategory('');
    setSelectedType('');
    setShowGcvOnly(false);
  };

  const hasFilters = search || selectedHub || selectedCategory || selectedType || showGcvOnly;

  const typeIcon = (type: string) => type === 'big_shop' ? Store : type === 'tuckshop' ? Store : User;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">
          {query ? `Results for "${query}"` : 'Browse all products'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ready ? `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found` : 'Loading\u2026'}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, shops…"
            className="pl-11 h-11 rounded-full bg-muted/50 border-0"
          />
        </div>
        <Button
          variant="outline"
          className="rounded-full h-11 px-4 sm:hidden"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className={cn('space-y-4 mb-6', !showFilters && 'hidden sm:block')}>
        {/* Shop type filter */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Store className="h-3 w-3" /> Shop Type
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                !selectedType
                  ? 'bg-zw-green text-white border-zw-green'
                  : 'border-border/60 hover:border-zw-green/30'
              )}
            >
              All shops
            </button>
            {SHOP_TYPE_FILTERS.map((item) => {
              const Icon = typeIcon(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => setSelectedType(item.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5',
                    selectedType === item.value
                      ? 'bg-zw-green text-white border-zw-green'
                      : 'border-border/60 hover:border-zw-green/30'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* GCV toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zw-green-50 border border-zw-green/20">
          <div className="flex items-center gap-2 text-sm font-medium text-zw-green-700">
            <ShieldCheck className="h-4 w-4" />
            Show GCV Only
          </div>
          <Switch
            checked={showGcvOnly}
            onCheckedChange={(v) => {
              setShowGcvOnly(v);
              setGcvOnly(v);
            }}
            className="data-[state=checked]:bg-zw-green"
          />
        </div>

        {/* Hub filter */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Hub
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedHub('')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                !selectedHub
                  ? 'bg-zw-green text-white border-zw-green'
                  : 'border-border/60 hover:border-zw-green/30'
              )}
            >
              All hubs
            </button>
            {HUBS.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHub(h.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  selectedHub === h.id
                    ? 'bg-zw-green text-white border-zw-green'
                    : 'border-border/60 hover:border-zw-green/30'
                )}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                !selectedCategory
                  ? 'bg-zw-green text-white border-zw-green'
                  : 'border-border/60 hover:border-zw-green/30'
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  selectedCategory === cat
                    ? 'bg-zw-green text-white border-zw-green'
                    : 'border-border/60 hover:border-zw-green/30'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-zw-red hover:underline flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      {ready ? (
        filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                seller={sellerMap.get(p.sellerId)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products match your filters.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-zw-green hover:underline"
              >
                Clear filters
              </button>
            )}
          </Card>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
