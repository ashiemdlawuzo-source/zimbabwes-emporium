'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, Seller, SHOP_TYPE_LABELS } from '@/lib/types';
import { formatPi, formatGcv, formatUsdApprox, timeAgo } from '@/lib/format';
import { GcvBadge } from './gcv-badge';
import { Card } from '@/components/ui/card';
import { MapPin, Store, User, Home, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

function StockBadge({ stock }: { stock: number }) {
  const color = stock === 0
    ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
    : stock < 3
      ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
      : stock < 10
        ? 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
        : 'bg-zw-green/10 text-zw-green border-zw-green/20';
  const label = stock === 0 ? 'Out of stock' : `${stock} in stock`;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border', color)}>
      <Package className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

export function ProductCard({
  product,
  seller,
  index = 0,
}: {
  product: Product;
  seller?: Seller;
  index?: number;
}) {
  const sellerType = seller?.type ?? 'individual';
  const TypeIcon = sellerType === 'big_shop' ? Store : sellerType === 'tuckshop' ? Store : sellerType === 'real_estate' ? Home : User;
  const isRealEstate = product.isRealEstate === true;

  if (isRealEstate) {
    return (
      <Link href={`/product/${product.id}`} className="group block h-full">
        <Card
          className={cn(
            'overflow-hidden h-full flex flex-col border-2 border-amber-400/60 transition-all duration-300',
            'hover:shadow-xl hover:shadow-amber-400/20 hover:border-amber-400 hover:-translate-y-1',
            'animate-fade-up bg-amber-50/20'
          )}
          style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-sm">
              <Home className="h-3 w-3" />
              {product.realEstateBadge ?? 'Real Estate'}
            </div>
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
              {timeAgo(product.createdAt)}
            </div>
          </div>

          <div className="flex flex-col flex-1 p-3 sm:p-4">
            <div className="flex items-center gap-1 text-xs text-amber-700 font-medium mb-1">
              <Home className="h-3 w-3" />
              <span className="truncate">Real Estate</span>
            </div>

            <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
              {product.name}
            </h3>

            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">
              {product.description}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <MapPin className="h-3 w-3" />
              <span className="capitalize">{product.hub}</span>
            </div>

            <div className="flex items-end justify-between mt-3 pt-3 border-t border-amber-200/50">
              <div>
                <div className="text-sm font-bold text-amber-700">
                  Deposit: {formatPi(product.pricePi)}
                </div>
                {product.usdFullPrice && (
                  <div className="text-[10px] text-muted-foreground">
                    Full price: ${product.usdFullPrice.toLocaleString('en-US')} USD
                  </div>
                )}
              </div>
              <div className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-all">
                Reserve
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card
        className={cn(
          'overflow-hidden h-full flex flex-col border-border/60 transition-all duration-300',
          'hover:shadow-xl hover:shadow-zw-green/10 hover:border-zw-green/30 hover:-translate-y-1',
          'animate-fade-up'
        )}
        style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {product.gcvSupported && (
            <div className="absolute top-2 left-2">
              <GcvBadge size="sm" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
            {timeAgo(product.createdAt)}
          </div>
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-zw-red text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TypeIcon className="h-3 w-3" />
            <span className="truncate">
              {seller?.name ?? 'Unknown seller'} · {SHOP_TYPE_LABELS[sellerType]}
            </span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-zw-green transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">
            {product.description}
          </p>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3" />
            <span className="capitalize">{product.hub}</span>
          </div>

          {product.stockQuantity != null && !isRealEstate && (
            <div className="mt-2">
              <StockBadge stock={product.stockQuantity} />
            </div>
          )}

          <div className="flex items-end justify-between mt-3 pt-3 border-t border-border/50">
            <div>
              <div className="text-lg font-bold text-zw-green font-heading">
                {formatPi(product.pricePi)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Approx {formatUsdApprox(product.pricePi)} (GCV $314,159)
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
