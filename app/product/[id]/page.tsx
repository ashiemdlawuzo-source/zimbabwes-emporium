'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMarket } from '@/lib/market-context';
import { useApp } from '@/lib/app-context';
import { getProduct, getProductsBySeller } from '@/lib/storage';
import { formatPi, formatGcv, formatUsdApprox, timeAgo } from '@/lib/format';
import { ProductCard } from '@/components/product-card';
import { GcvBadge } from '@/components/gcv-badge';
import { PiPaymentDialog } from '@/components/pi-payment-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Phone,
  Store,
  User,
  Home,
  ShieldCheck,
  ArrowLeft,
  Tag,
  Package,
  Truck,
  HandCoins,
  CircleCheck,
  ShoppingCart,
  Check,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';
import { SHOP_TYPE_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { sellers, ready } = useMarket();
  const { addToCart } = useApp();
  const [payOpen, setPayOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!ready) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const product = getProduct(id);
  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">This product may have been removed.</p>
        <Button onClick={() => router.push('/search')} className="bg-zw-green text-white rounded-full">
          Browse products
        </Button>
      </div>
    );
  }

  const seller = sellers.find((s) => s.id === product.sellerId);
  const sellerProducts = getProductsBySeller(product.sellerId).filter((p) => p.id !== product.id).slice(0, 4);
  const sellerType = seller?.type ?? 'individual';
  const TypeIcon = sellerType === 'big_shop' ? Store : sellerType === 'tuckshop' ? Store : sellerType === 'real_estate' ? Home : User;
  const isRealEstate = product.isRealEstate === true;
  const stock = product.stockQuantity ?? 100;
  const outOfStock = stock === 0;
  const lineTotal = product.pricePi * quantity;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      sellerId: product.sellerId,
      name: product.name,
      pricePi: product.pricePi,
      image: product.image,
      hub: product.hub,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const incQty = () => {
    if (quantity < stock) setQuantity((q) => q + 1);
  };
  const decQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="animate-fade-up">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.gcvSupported && (
              <div className="absolute top-3 left-3">
                <GcvBadge />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {seller && (
            <Link
              href={`/shop/${seller.id}`}
              className="inline-flex items-center gap-2 mb-4 group"
            >
              <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <div className="text-sm font-medium group-hover:text-zw-green transition-colors">{seller.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" /> {SHOP_TYPE_LABELS[sellerType]}
                </div>
              </div>
            </Link>
          )}

          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {product.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> <span className="capitalize">{product.hub}</span> Hub
            </span>
            <span>{timeAgo(product.createdAt)}</span>
          </div>

          {/* Stock + Quantity selector */}
          {!isRealEstate && (
            <div className="mb-6 space-y-3">
              {/* Stock badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border',
                  outOfStock
                    ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                    : stock < 3
                      ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                      : stock < 10
                        ? 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
                        : 'bg-zw-green/10 text-zw-green border-zw-green/20'
                )}>
                  <Package className="h-4 w-4" />
                  {outOfStock ? 'Out of stock' : `${stock} in stock`}
                </span>
              </div>

              {/* Quantity selector */}
              {!outOfStock && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold">Quantity</label>
                  <div className="flex items-center gap-1 border-2 border-border rounded-xl p-1">
                    <button
                      onClick={decQty}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg font-mono">{quantity}</span>
                    <button
                      onClick={incQty}
                      disabled={quantity >= stock}
                      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Live price calc */}
                  <div className="text-sm text-muted-foreground">
                    {quantity} × {formatPi(product.pricePi)} = <span className="font-bold text-zw-green">{formatPi(lineTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            {isRealEstate ? (
              <div className="space-y-1">
                <div className="text-3xl font-bold font-heading text-amber-600">
                  Deposit: {formatPi(product.pricePi)}
                </div>
                {product.usdFullPrice && (
                  <div className="text-sm text-muted-foreground">
                    Full price: ${product.usdFullPrice.toLocaleString('en-US')} USD
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold font-heading text-zw-green">
                  {formatPi(product.pricePi)}
                </div>
                {product.gcvSupported && (
                  <div className="pb-1 text-sm text-muted-foreground">
                    GCV {formatGcv(product.pricePi)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Real estate badge */}
          {isRealEstate && product.realEstateBadge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4">
              <Home className="h-4 w-4" />
              {product.realEstateBadge}
            </div>
          )}

          {/* Description */}
          <p className="text-foreground/80 mb-6 leading-relaxed">{product.description}</p>

          {/* GCV info */}
          {product.gcvSupported && (
            <Card className="p-4 mb-6 bg-zw-green-50 border-zw-green/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-zw-green shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-zw-green-700">GCV Verified Product</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Global Consensus Value: $314,159 = 1 Pi. This product&rsquo;s Pi price reflects the GCV standard.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Real estate disclaimer */}
          {isRealEstate && (
            <Card className="p-4 mb-6 bg-amber-50 border-amber-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-amber-800">Important: Pi Payment is for Reservation Only</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Pi payment is for reservation/viewing fee only. Property transfer follows Zimbabwe legal process (Deeds Office, Council). Full balance payable via bank transfer.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Delivery */}
          {!isRealEstate && (
            <Card className="p-4 mb-6 border-border/60">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-zw-green shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Hub-based escrow delivery</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Pick up or arrange delivery through the <span className="capitalize font-medium">{product.hub}</span> hub. Pi is held in escrow until you confirm receipt.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className={cn(
                'flex-1 h-12 rounded-full text-base font-semibold text-white',
                isRealEstate ? 'bg-amber-500 hover:bg-amber-600' : 'bg-zw-green hover:bg-zw-green-600'
              )}
              onClick={() => setPayOpen(true)}
              disabled={outOfStock && !isRealEstate}
            >
              <HandCoins className="h-5 w-5 mr-1.5" />
              {isRealEstate ? 'Reserve with Pi' : outOfStock ? 'Out of Stock' : 'Buy with Pi Now'}
            </Button>
            {!isRealEstate && (
              <Button
                variant={added ? 'default' : 'outline'}
                className={cn(
                  'h-12 rounded-full text-base font-semibold transition-all',
                  added && 'bg-zw-green text-white border-zw-green'
                )}
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {added ? (
                  <><Check className="h-5 w-5 mr-1.5" /> Added!</>
                ) : outOfStock ? (
                  <><Package className="h-5 w-5 mr-1.5" /> Out of Stock</>
                ) : (
                  <><ShoppingCart className="h-5 w-5 mr-1.5" /> Add {quantity > 1 ? quantity + ' to Cart' : 'to Cart'}</>
                )}
              </Button>
            )}
            {seller && (
              <Button
                variant="outline"
                className="h-12 rounded-full text-base"
                onClick={() => router.push(`/shop/${seller.id}`)}
              >
                View Shop
              </Button>
            )}
          </div>

          {product && (
            <PiPaymentDialog
              product={product}
              seller={seller}
              open={payOpen}
              onOpenChange={setPayOpen}
              buyQuantity={quantity}
            />
          )}

          {/* Steps */}
          {!isRealEstate && (
            <div className="mt-8 space-y-3">
              {[
                { icon: HandCoins, title: 'Pay in Pi', desc: 'Send the Pi price to escrow.' },
                { icon: Truck, title: 'Deliver via hub', desc: `Pick up or deliver through ${product.hub}.` },
                { icon: CircleCheck, title: 'Confirm receipt', desc: 'Pi released to seller when you confirm.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zw-green/10 flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0, 151, 57, 0.1)' }}>
                    <step.icon className="h-4 w-4 text-zw-green" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real estate steps */}
          {isRealEstate && (
            <div className="mt-8 space-y-3">
              {[
                { icon: HandCoins, title: 'Reserve with Pi', desc: 'Pay the Pi reservation deposit to secure the property.' },
                { icon: Home, title: 'Arrange viewing', desc: 'Seller contacts you within 24hrs to arrange a viewing.' },
                { icon: CircleCheck, title: 'Legal transfer', desc: 'Property transfer via Deeds Office and Council. Balance by bank transfer.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <step.icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* More from this seller */}
      {sellerProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-4">More from this shop</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {sellerProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} seller={seller} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


