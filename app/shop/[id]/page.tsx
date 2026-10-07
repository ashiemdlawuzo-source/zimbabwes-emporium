'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMarket } from '@/lib/market-context';
import { getSeller, getProductsBySeller } from '@/lib/storage';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Phone,
  Store,
  User,
  ArrowLeft,
  Package,
  Calendar,
  Upload,
} from 'lucide-react';
import { SHOP_TYPE_LABELS, SHOP_TYPE_DESCRIPTIONS } from '@/lib/types';
import { timeAgo } from '@/lib/format';

export default function ShopPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { ready } = useMarket();

  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-32 bg-muted rounded-2xl animate-pulse mb-6" />
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const seller = getSeller(id);
  if (!seller) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Shop not found</h1>
        <p className="text-muted-foreground mb-6">This shop may no longer be active.</p>
        <Link href="/search">
          <Button className="bg-zw-green text-white rounded-full">Browse products</Button>
        </Link>
      </div>
    );
  }

  const products = getProductsBySeller(id);
  const TypeIcon = seller.type === 'big_shop' ? Store : seller.type === 'tuckshop' ? Store : User;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      {/* Shop header */}
      <Card className="overflow-hidden border-border/60 animate-fade-up">
        <div className="h-24 bg-gradient-to-r from-zw-green to-zw-green-600 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-zimbabwe-flag" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-16">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-background shadow-lg shrink-0">
              <Image
                src={seller.avatar}
                alt={seller.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1 pt-2 sm:pt-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TypeIcon className="h-4 w-4" />
                {SHOP_TYPE_LABELS[seller.type]}
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">{seller.name}</h1>
              <p className="text-muted-foreground mt-2 max-w-lg">{seller.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/40">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <MapPin className="h-3 w-3" /> Hub
              </div>
              <div className="font-semibold capitalize">{seller.hub}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <Package className="h-3 w-3" /> Products
              </div>
              <div className="font-semibold">{products.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <Phone className="h-3 w-3" /> Phone
              </div>
              <div className="font-semibold text-sm">{seller.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                <Calendar className="h-3 w-3" /> Joined
              </div>
              <div className="font-semibold text-sm">{timeAgo(seller.createdAt)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Products */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold">Products</h2>
          <Link href="/sell/upload">
            <Button variant="outline" className="rounded-full text-sm">
              <Upload className="h-4 w-4 mr-1" /> Add product
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} seller={seller} index={i} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products listed yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
