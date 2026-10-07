'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { formatPi } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PiCheckoutDialog } from '@/components/pi-checkout-dialog';
import { HUBS, DeliveryType, RegisteredHub, HubType } from '@/lib/types';
import { getProduct } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Package,
  Wallet,
  Truck,
  ShieldCheck,
  Check,
  Globe,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, registeredHubs } = useApp();
  const { toast } = useToast();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('direct');
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');

  // Build merged hub list: static HUBS (country) + registered hubs
  const allHubsList = useMemo(() => {
    const staticHubs = HUBS.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.name,
      description: h.description,
      hubType: 'country' as HubType,
      isCountryWide: true,
      province: '',
      district: '',
      village: '',
      suburb: '',
      feePi: 0,
      phone: '',
      isStatic: true,
    }));
    const dynamic = registeredHubs.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      description: h.description,
      hubType: h.hubType ?? 'country',
      isCountryWide: h.isCountryWide ?? false,
      province: h.province ?? '',
      district: h.district ?? '',
      village: h.village ?? '',
      suburb: h.suburb ?? '',
      feePi: h.feePi,
      phone: h.phone,
      isStatic: false,
    }));
    return [...staticHubs, ...dynamic];
  }, [registeredHubs]);

  // Sort hubs: local matches first, then country hubs
  const sortedHubs = useMemo(() => {
    const q = villageSearch.trim().toLowerCase();
    if (!q) return allHubsList;

    const localMatches = allHubsList.filter((h) =>
      h.hubType === 'local' && (
        h.village.toLowerCase().includes(q) ||
        h.suburb.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.province.toLowerCase().includes(q)
      )
    );
    const countryHubs = allHubsList.filter((h) => h.hubType === 'country');
    const otherLocals = allHubsList.filter((h) =>
      h.hubType === 'local' && !localMatches.includes(h)
    );

    return [...localMatches, ...countryHubs, ...otherLocals];
  }, [allHubsList, villageSearch]);

  const hasLocalMatches = sortedHubs.some((h, i) =>
    h.hubType === 'local' && villageSearch.trim() && i < sortedHubs.findIndex((x) => x.hubType === 'country')
  );
  const canCheckout = deliveryType === 'direct' || (deliveryType === 'hub_escrow' && !!selectedHub);

  const cartWithStock = useMemo(() => {
    return cart.map((item) => {
      const product = getProduct(item.productId);
      const stock = product?.stockQuantity ?? 100;
      return { ...item, stock };
    });
  }, [cart]);

  const handleIncQuantity = (productId: string, currentQty: number, stock: number) => {
    if (currentQty >= stock) {
      toast({ title: 'Stock limit reached', description: `Only ${stock} left in stock!`, variant: 'destructive' });
      return;
    }
    updateQuantity(productId, currentQty + 1);
  };

  const handleDecQuantity = (productId: string, currentQty: number) => {
    if (currentQty <= 1) return;
    updateQuantity(productId, currentQty - 1);
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    setCheckoutOpen(true);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Browse products and add items to your cart to checkout with Pi.
        </p>
        <Link href="/search">
          <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11 px-6">
            Browse Products <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">
        Shopping Cart
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartWithStock.map((item) => (
            <Card key={item.productId} className="p-4 flex items-center gap-4 border-border/60">
              <Link href={`/product/${item.productId}`} className="shrink-0">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`}>
                  <h3 className="font-semibold text-sm sm:text-base hover:text-zw-green transition-colors truncate">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="capitalize">{item.hub}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-zw-green font-heading">
                    {formatPi(item.pricePi)}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                    item.stock === 0
                      ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                      : item.stock < 3
                        ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                        : item.stock < 10
                          ? 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
                          : 'bg-zw-green/10 text-zw-green border-zw-green/20'
                  )}>
                    <Package className="h-2.5 w-2.5" />
                    {item.stock} in stock
                  </span>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDecQuantity(item.productId, item.quantity)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleIncQuantity(item.productId, item.quantity, item.stock)}
                  disabled={item.quantity >= item.stock}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.productId)}
                className="p-2 rounded-lg text-muted-foreground hover:text-zw-red hover:bg-zw-red/5 transition-colors shrink-0"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-border/60 sticky top-20">
            <h2 className="font-heading text-lg font-bold mb-4">Order Summary</h2>

            {/* Delivery type selection */}
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Delivery Method</label>
              <div className="space-y-2">
                {/* Direct Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('direct')}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    deliveryType === 'direct'
                      ? 'border-zw-green bg-zw-green-50'
                      : 'border-border/60 hover:border-zw-green/30'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                    deliveryType === 'direct' ? 'border-zw-green bg-zw-green' : 'border-border'
                  )}>
                    {deliveryType === 'direct' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-zw-green" />
                      <span className="font-semibold text-sm">Direct Delivery</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pay seller directly — seller delivers to your address. No hub needed.
                    </p>
                  </div>
                </button>

                {/* Hub Escrow */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('hub_escrow')}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    deliveryType === 'hub_escrow'
                      ? 'border-zw-green bg-zw-green-50'
                      : 'border-border/60 hover:border-zw-green/30'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                    deliveryType === 'hub_escrow' ? 'border-zw-green bg-zw-green' : 'border-border'
                  )}>
                    {deliveryType === 'hub_escrow' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-zw-green" />
                      <span className="font-semibold text-sm">Escrow via Hub (Safer)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Use a Zimbabwe hub for escrow safety. Pi held until you confirm delivery.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Hub selection (only for hub_escrow) */}
            {deliveryType === 'hub_escrow' && (
              <div className="mb-4 animate-fade-in">
                {/* Village/suburb search */}
                <label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <MapPin className="h-4 w-4 text-zw-green" /> Your Village / Suburb
                </label>
                <input
                  type="text"
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                  placeholder="e.g. Buhera, Village 5 / Mbare / Highfields"
                  className="w-full h-11 rounded-xl border border-border/60 px-3 text-sm mb-3 focus:outline-none focus:border-zw-green"
                />

                <label className="text-sm font-semibold mb-2 block">Select Hub</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {sortedHubs.map((h, idx) => {
                    const isSelected = selectedHub === h.id;
                    const isLocalMatch = h.hubType === 'local' && villageSearch.trim() && idx < sortedHubs.findIndex((x) => x.hubType === 'country');
                    const locationText = h.hubType === 'local'
                      ? [h.village || h.suburb, h.district, h.province].filter(Boolean).join(', ')
                      : h.isCountryWide ? 'Zimbabwe-wide' : h.city;
                    return (
                      <div key={h.id}>
                        {isLocalMatch && idx === 0 && (
                          <div className="text-xs font-semibold text-zw-green mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Nearest to you
                          </div>
                        )}
                        {h.hubType === 'country' && idx === sortedHubs.findIndex((x) => x.hubType === 'country') && villageSearch.trim() && (
                          <div className="text-xs font-semibold text-muted-foreground mb-1 mt-2 flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Nationwide Delivery - Can reach your area
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedHub(h.id)}
                          className={cn(
                            'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                            isSelected
                              ? 'border-zw-green bg-zw-green/5'
                              : 'border-border/60 hover:border-zw-green/30'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                            isSelected ? 'border-zw-green bg-zw-green' : 'border-border'
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {h.hubType === 'country' ? (
                                <Globe className="h-4 w-4 text-zw-green shrink-0" />
                              ) : (
                                <Home className="h-4 w-4 text-zw-yellow-600 shrink-0" />
                              )}
                              <span className="font-semibold text-sm truncate">{h.name}</span>
                              <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                                h.hubType === 'country'
                                  ? 'bg-zw-green/10 text-zw-green'
                                  : 'bg-zw-yellow/10 text-zw-yellow-700'
                              )}>
                                {h.hubType === 'country' ? 'Country' : 'Village'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{locationText}</p>
                            {h.phone && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{h.phone}</p>
                            )}
                            {h.feePi > 0 && (
                              <p className="text-[10px] text-zw-green font-medium mt-0.5">
                                Fee: {formatPi(h.feePi)}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* No local hub found message */}
                {villageSearch.trim() && !sortedHubs.some((h) => h.hubType === 'local' && (
                  h.village.toLowerCase().includes(villageSearch.toLowerCase()) ||
                  h.suburb.toLowerCase().includes(villageSearch.toLowerCase()) ||
                  h.district.toLowerCase().includes(villageSearch.toLowerCase())
                )) && (
                  <div className="mt-2 p-3 rounded-xl bg-zw-yellow/5 border border-zw-yellow/20 text-xs">
                    <p className="text-zw-yellow-700 font-medium">
                      No hub in your village yet - Be the first hub!
                    </p>
                    <Link href="/hub/register" className="text-zw-green font-semibold underline mt-1 inline-block">
                      Register as Hub
                    </Link>
                  </div>
                )}

                {selectedHub && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-zw-green/10 border border-zw-green/20 flex items-center gap-1.5 text-sm font-medium text-zw-green">
                    <Check className="h-4 w-4" /> Delivering via: {sortedHubs.find(h => h.id === selectedHub)?.name}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">
                  Pi is held in escrow at the selected hub until you confirm delivery.
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4 pb-4 border-b border-border/40">
              {cartWithStock.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPi(item.pricePi * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold font-heading text-zw-green">
                {formatPi(cartTotal)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!canCheckout}
              className="w-full h-12 bg-zw-green hover:bg-zw-green-600 text-white rounded-full text-base font-semibold disabled:opacity-50"
            >
              <Wallet className="h-5 w-5 mr-1.5" /> Checkout with Pi
            </Button>
            {!canCheckout && deliveryType === 'hub_escrow' && (
              <p className="text-xs text-zw-red mt-2 text-center">
                Please select a hub for escrow delivery.
              </p>
            )}
          </Card>
        </div>
      </div>

      <PiCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        deliveryType={deliveryType}
        hubId={deliveryType === 'hub_escrow' ? selectedHub : null}
        totalPi={cartTotal}
      />
    </div>
  );
}
