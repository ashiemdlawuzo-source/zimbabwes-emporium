'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePiSdk } from '@/lib/use-pi-sdk';
import { useApp, generateDeliveryCode } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Wallet, Package, Truck, ShieldCheck, MapPin, Check, Package2, Box } from 'lucide-react';
import { formatPi } from '@/lib/format';
import { HUBS, DeliveryType, Product, Seller, Order, OrderItem } from '@/lib/types';
import { calculateHubFee, inferGoodsType, GoodsType, GOODS_TYPE_LABELS } from '@/lib/hub-fee';
import { decreaseProductStock } from '@/lib/storage';
import { cn } from '@/lib/utils';

type PaymentState = 'idle' | 'creating' | 'awaiting_approval' | 'awaiting_completion' | 'success' | 'cancelled' | 'error';

interface PiPaymentDialogProps {
  product: Product;
  seller?: Seller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyQuantity?: number;
}

export function PiPaymentDialog({ product, seller, open, onOpenChange, buyQuantity = 1 }: PiPaymentDialogProps) {
  const { sdk, loading, error: sdkError, createPayment } = usePiSdk();
  const { saveOrder, piUser } = useApp();
  const router = useRouter();
  const [state, setState] = useState<PaymentState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('direct');
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [goodsType, setGoodsType] = useState<GoodsType>(inferGoodsType(product.category));

  const hubOptions = HUBS;

  const feeResult = useMemo(() => {
    if (deliveryType !== 'hub_escrow' || !selectedHub) return null;
    const hub = HUBS.find((h) => h.id === selectedHub);
    if (!hub) return null;
    return calculateHubFee(product.hub, hub.name, goodsType);
  }, [deliveryType, selectedHub, product.hub, goodsType]);

  const productAmount = product.pricePi * buyQuantity;
  const totalAmount = productAmount + (feeResult?.fee ?? 0);
  const canPay = deliveryType === 'direct' || (deliveryType === 'hub_escrow' && !!selectedHub);
  const effectiveGoodsType: GoodsType = buyQuantity > 5 ? 'large' : goodsType;

  const handlePayment = useCallback(() => {
    if (!sdk || !canPay) return;
    setState('creating');
    setErrorMsg('');

    const oId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(oId);

    const hub = selectedHub ? HUBS.find((h) => h.id === selectedHub) : null;

    const metadata = {
      orderId: oId,
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      sellerName: seller?.name ?? 'Unknown',
      hub: product.hub,
      gcvSupported: product.gcvSupported,
      productAmount,
      buyQuantity,
      hubFee: feeResult?.fee ?? 0,
      distanceKm: feeResult?.distance ?? 0,
      goodsType: effectiveGoodsType,
      totalAmount,
      deliveryType,
      hubId: selectedHub || null,
      hubName: hub?.name ?? null,
      timestamp: Date.now(),
    };

    const memo = deliveryType === 'hub_escrow'
      ? `Buy ${product.name} — ${formatPi(totalAmount)} (goods + hub fee) via ${hub?.name} hub escrow`
      : `Buy ${product.name} from ${seller?.name ?? 'seller'} — Direct Delivery`;

    createPayment(
      totalAmount,
      memo,
      metadata,
      {
        onReadyForServerApproval: (pid: string) => {
          setPaymentId(pid);
          setState('awaiting_approval');
          fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: pid }),
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || data.error || `Approval failed (${res.status})`);
              return data;
            })
            .then(() => {
              setState('awaiting_completion');
            })
            .catch((err: Error) => {
              setState('error');
              setErrorMsg(err.message || 'Server approval failed. Please try again.');
            });
        },
        onReadyForServerCompletion: (pid: string, txid: string) => {
          setState('awaiting_completion');
          fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: pid, txid }),
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || data.error || `Completion failed (${res.status})`);
              return data;
            })
            .then(() => {
              const orderItems: OrderItem[] = [{
                productId: product.id,
                sellerId: product.sellerId,
                sellerName: seller?.name ?? 'Unknown',
                name: product.name,
                pricePi: product.pricePi,
                image: product.image,
                quantity: buyQuantity,
              }];

              const order: Order = {
                id: oId,
                buyerName: piUser?.username ?? 'Guest',
                items: orderItems,
                totalPi: totalAmount,
                productAmount,
                hubFee: feeResult?.fee,
                distanceKm: feeResult?.distance,
                goodsType: effectiveGoodsType,
                deliveryType,
                hubId: deliveryType === 'hub_escrow' ? selectedHub : null,
                hubName: hub?.name ?? null,
                status: 'paid',
                paymentId: pid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                deliveryCode: deliveryType === 'hub_escrow' ? generateDeliveryCode() : undefined,
              };

              saveOrder(order);
              decreaseProductStock([{ productId: product.id, quantity: buyQuantity }]);
              setState('success');
            })
            .catch(() => {
              setState('error');
              setErrorMsg('Server completion failed. Payment may still be processing.');
            });
        },
        onCancel: (pid: string) => {
          setPaymentId(pid);
          setState('cancelled');
        },
        onError: (err: Error) => {
          setState('error');
          setErrorMsg(err.message || 'Payment failed');
        },
      }
    );
  }, [sdk, product, seller, createPayment, saveOrder, piUser, canPay, deliveryType, selectedHub, goodsType, feeResult, totalAmount, productAmount, buyQuantity, effectiveGoodsType]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setState('idle');
      setErrorMsg('');
      setPaymentId('');
      setOrderId('');
      setDeliveryType('direct');
      setSelectedHub('');
    }
    onOpenChange(newOpen);
  };

  const stateConfig: Record<PaymentState, { icon: typeof Loader2; title: string; desc: string; color: string }> = {
    idle: {
      icon: Wallet,
      title: 'Confirm your purchase',
      desc: `Pay ${formatPi(totalAmount)} to ${seller?.name ?? 'the seller'} via Pi Network.`,
      color: 'text-zw-green',
    },
    creating: {
      icon: Loader2,
      title: 'Opening Pi wallet…',
      desc: 'Preparing your payment. Please wait.',
      color: 'text-zw-green',
    },
    awaiting_approval: {
      icon: Loader2,
      title: 'Awaiting server approval',
      desc: 'Your payment is being approved by our server. Do not close this window.',
      color: 'text-zw-yellow-600',
    },
    awaiting_completion: {
      icon: Loader2,
      title: 'Confirming on blockchain',
      desc: 'Payment approved. Waiting for blockchain confirmation.',
      color: 'text-zw-yellow-600',
    },
    success: {
      icon: CheckCircle2,
      title: 'Payment successful!',
      desc: deliveryType === 'hub_escrow'
        ? `Your order for ${product.name} has been placed via ${HUBS.find(h => h.id === selectedHub)?.name} hub escrow. Check My Orders for your delivery code.`
        : `Your order for ${product.name} has been placed. The seller will deliver directly to you.`,
      color: 'text-zw-green',
    },
    cancelled: {
      icon: XCircle,
      title: 'Payment cancelled',
      desc: 'You cancelled the payment. No Pi was charged.',
      color: 'text-muted-foreground',
    },
    error: {
      icon: AlertCircle,
      title: 'Payment error',
      desc: errorMsg || 'Something went wrong with your payment.',
      color: 'text-zw-red',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;
  const isSpinner = state === 'creating' || state === 'awaiting_approval' || state === 'awaiting_completion';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-zw-green" />
            Pi Checkout
          </DialogTitle>
          <DialogDescription>
            Pay with Pi Network
          </DialogDescription>
        </DialogHeader>

        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{product.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {seller?.name ?? 'Unknown seller'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zw-green">{formatPi(product.pricePi)}</div>
            {buyQuantity > 1 && (
              <div className="text-[10px] text-muted-foreground">{buyQuantity} × {formatPi(product.pricePi)}</div>
            )}
            {product.gcvSupported && (
              <div className="text-[10px] text-muted-foreground">GCV verified</div>
            )}
          </div>
        </div>

        {/* Delivery method + hub selection (idle state only) */}
        {state === 'idle' && (
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Delivery Method</label>
            <div className="space-y-2">
              {/* Direct */}
              <button
                type="button"
                onClick={() => setDeliveryType('direct')}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                  deliveryType === 'direct'
                    ? 'border-zw-green bg-zw-green/5'
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
                    Seller delivers directly to your address.
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
                    ? 'border-zw-green bg-zw-green/5'
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
                    Pi held in escrow until you confirm receipt.
                  </p>
                </div>
              </button>
            </div>

            {/* Goods type selection */}
            {deliveryType === 'hub_escrow' && (
              <div className="mt-3 animate-fade-in">
                <label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Package2 className="h-4 w-4 text-zw-green" /> Goods Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoodsType('small')}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                      goodsType === 'small'
                        ? 'border-zw-green bg-zw-green/5'
                        : 'border-border/60 hover:border-zw-green/30'
                    )}
                  >
                    <Box className="h-4 w-4 text-zw-green shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">Small</div>
                      <div className="text-[10px] text-muted-foreground">Phones, food, clothes</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoodsType('large')}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                      goodsType === 'large'
                        ? 'border-zw-green bg-zw-green/5'
                        : 'border-border/60 hover:border-zw-green/30'
                    )}
                  >
                    <Package2 className="h-4 w-4 text-zw-green shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">Large</div>
                      <div className="text-[10px] text-muted-foreground">Fridges, furniture, building</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Hub selection cards */}
            {deliveryType === 'hub_escrow' && (
              <div className="mt-3 animate-fade-in">
                <label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <MapPin className="h-4 w-4 text-zw-green" /> Select Hub
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {hubOptions.map((h) => {
                    const isSelected = selectedHub === h.id;
                    return (
                      <button
                        key={h.id}
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
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-zw-green" />
                            <span className="font-semibold text-sm">{h.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fee breakdown */}
            {deliveryType === 'hub_escrow' && selectedHub && feeResult && (
              <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/40 animate-fade-in">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Breakdown</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product to {seller?.name ?? 'seller'}</span>
                    <span className="font-medium">{formatPi(product.pricePi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Hub fee to {HUBS.find(h => h.id === selectedHub)?.name}
                    </span>
                    <span className="font-medium">{formatPi(feeResult.fee)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 pl-2 flex justify-between">
                    <span>{feeResult.distance}km · {GOODS_TYPE_LABELS[goodsType]}</span>
                    <span>auto-calculated</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/40">
                  <span className="font-bold text-base">TOTAL (pay once)</span>
                  <span className="font-bold text-lg text-zw-green">{formatPi(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State display */}
        <div className="flex flex-col items-center text-center py-4">
          <Icon
            className={`h-12 w-12 mb-3 ${config.color} ${isSpinner ? 'animate-spin' : ''}`}
          />
          <h3 className="font-semibold text-base mb-1">{config.title}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{config.desc}</p>
          {paymentId && state !== 'idle' && (
            <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">
              Payment ID: {paymentId}
            </p>
          )}
          {orderId && state === 'success' && (
            <p className="text-xs font-mono text-zw-green mt-2 font-bold">
              Order ID: {orderId}
            </p>
          )}
        </div>

        {/* Actions */}
        {state === 'idle' && (
          <Button
            onClick={handlePayment}
            disabled={loading || !!sdkError || !canPay}
            className="w-full h-14 bg-zw-green hover:bg-zw-green-600 text-white rounded-xl text-lg font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-1.5 animate-spin" /> Loading Pi SDK…
              </>
            ) : sdkError ? (
              'Pi SDK unavailable'
            ) : deliveryType === 'hub_escrow' ? (
              <>
                <Wallet className="h-5 w-5 mr-1.5" /> Pay {formatPi(totalAmount)} Once — Goods + Hub
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-1.5" /> Pay {formatPi(product.pricePi)}
              </>
            )}
          </Button>
        )}

        {state === 'idle' && deliveryType === 'hub_escrow' && !selectedHub && (
          <p className="text-xs text-center text-zw-red mt-2">
            Please select a hub for escrow delivery.
          </p>
        )}

        {state === 'success' && (
          <div className="space-y-2">
            <Button
              onClick={() => {
                handleOpenChange(false);
                router.push(`/orders/${orderId}`);
              }}
              className="w-full h-12 bg-zw-green hover:bg-zw-green-600 text-white rounded-full"
            >
              <Package className="h-5 w-5 mr-1.5" /> View Order
            </Button>
            <Button
              onClick={() => handleOpenChange(false)}
              variant="outline"
              className="w-full h-11 rounded-full"
            >
              Done
            </Button>
          </div>
        )}

        {(state === 'cancelled' || state === 'error') && (
          <Button
            onClick={() => setState('idle')}
            variant="outline"
            className="w-full h-12 rounded-full"
          >
            Try Again
          </Button>
        )}

        {isSpinner && (
          <p className="text-xs text-center text-muted-foreground">
            Do not close this window while payment is processing.
          </p>
        )}

        {sdkError && state === 'idle' && (
          <p className="text-xs text-center text-zw-red mt-2">
            {sdkError} Open this page in the Pi Browser app to pay with Pi.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
