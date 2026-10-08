'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePiSdk } from '@/lib/use-pi-sdk';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Wallet, Package, Truck, MapPin, ShieldCheck } from 'lucide-react';
import { formatPi } from '@/lib/format';
import { HUBS, Order, OrderItem, DeliveryType } from '@/lib/types';
import { generateDeliveryCode } from '@/lib/app-context';
import { calculateHubFee, inferGoodsType, GoodsType, GOODS_TYPE_LABELS } from '@/lib/hub-fee';
import { decreaseProductStock } from '@/lib/storage';

type PaymentState = 'idle' | 'creating' | 'awaiting_approval' | 'awaiting_completion' | 'success' | 'cancelled' | 'error';

interface PiCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryType: DeliveryType;
  hubId: string | null;
  totalPi: number;
}

export function PiCheckoutDialog({ open, onOpenChange, deliveryType, hubId, totalPi }: PiCheckoutDialogProps) {
  const { sdk, loading, error: sdkError, createPayment } = usePiSdk();
  const { cart, clearCart, saveOrder, piUser } = useApp();
  const router = useRouter();
  const [state, setState] = useState<PaymentState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  const hub = hubId ? HUBS.find((h) => h.id === hubId) : null;
  const isDirect = deliveryType === 'direct';

  const cartProductAmount = totalPi;

  const goodsType: GoodsType = useMemo(() => {
    const totalQty = cart.reduce((sum, c) => sum + c.quantity, 0);
    if (totalQty > 5) return 'large';
    const hasLarge = cart.some((c) => {
      const cat = c.name;
      return ['Appliances', 'Electronics', 'Hardware & Spares', 'Real Estate'].some((l) =>
        cat.toLowerCase().includes(l.toLowerCase())
      );
    });
    return hasLarge ? 'large' : 'small';
  }, [cart]);

  const sellerCity = useMemo(() => {
    if (cart.length === 0) return 'Harare';
    const hubMap: Record<string, string> = {
      harare: 'Harare', bulawayo: 'Bulawayo', mutare: 'Mutare', gweru: 'Gweru', masvingo: 'Masvingo',
    };
    return hubMap[cart[0].hub] ?? 'Harare';
  }, [cart]);

  const feeResult = useMemo(() => {
    if (isDirect || !hub) return null;
    return calculateHubFee(sellerCity, hub.name, goodsType);
  }, [isDirect, hub, sellerCity, goodsType]);

  const grandTotal = cartProductAmount + (feeResult?.fee ?? 0);

  const handlePayment = useCallback(() => {
    if (!sdk) return;
    setState('creating');
    setErrorMsg('');

    const oId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(oId);

    const metadata = {
      orderId: oId,
      deliveryType,
      hubId: hubId ?? null,
      hubName: hub?.name ?? null,
      productAmount: cartProductAmount,
      hubFee: feeResult?.fee ?? 0,
      distanceKm: feeResult?.distance ?? 0,
      goodsType,
      totalAmount: grandTotal,
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        quantity: c.quantity,
        pricePi: c.pricePi,
      })),
      timestamp: Date.now(),
    };

    const memo = isDirect
      ? `Order ${oId} — ${cart.length} item(s) — Direct Delivery`
      : `Order ${oId} — ${cart.length} item(s) via ${hub?.name} hub escrow — ${formatPi(grandTotal)} (goods + hub fee)`;

    createPayment(
      grandTotal,
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
              const orderItems: OrderItem[] = cart.map((c) => ({
                productId: c.productId,
                sellerId: c.sellerId,
                sellerName: c.name,
                name: c.name,
                pricePi: c.pricePi,
                image: c.image,
                quantity: c.quantity,
              }));

              const order: Order = {
                id: oId,
                buyerName: piUser?.username ?? 'Guest',
                items: orderItems,
                totalPi: grandTotal,
                productAmount: cartProductAmount,
                hubFee: feeResult?.fee,
                distanceKm: feeResult?.distance,
                goodsType,
                deliveryType,
                hubId: hubId ?? null,
                hubName: hub?.name ?? null,
                status: 'paid',
                paymentId: pid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                deliveryCode: deliveryType === 'hub_escrow' ? generateDeliveryCode() : undefined,
              };

              saveOrder(order);
              decreaseProductStock(cart.map((c) => ({ productId: c.productId, quantity: c.quantity })));
              clearCart();
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
  }, [sdk, hub, hubId, deliveryType, isDirect, cart, cartProductAmount, feeResult, grandTotal, goodsType, createPayment, saveOrder, clearCart, piUser]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setState('idle');
      setErrorMsg('');
      setPaymentId('');
      setOrderId('');
    }
    onOpenChange(newOpen);
  };

  const stateConfig: Record<PaymentState, { icon: typeof Loader2; title: string; desc: string; color: string }> = {
    idle: {
      icon: Wallet,
      title: 'Confirm your order',
      desc: isDirect
        ? `Pay ${formatPi(cartProductAmount)} for ${cart.length} item(s). Direct delivery — seller ships to your address.`
        : `Pay ${formatPi(grandTotal)} for ${cart.length} item(s) via ${hub?.name} hub escrow (goods + hub fee).`,
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
      title: 'Order placed successfully!',
      desc: isDirect
        ? `Order ${orderId} placed. The seller will deliver directly to you.`
        : `Order ${orderId} placed via ${hub?.name} hub escrow. Check My Orders for your delivery code.`,
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
          <DialogDescription className="flex items-center gap-1.5">
            {isDirect ? (
              <><Truck className="h-3.5 w-3.5" /> Direct Delivery — pay seller directly</>
            ) : (
              <><MapPin className="h-3.5 w-3.5" /> Escrow via {hub?.name} hub</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Items summary */}
        <div className="space-y-2 p-3 rounded-xl bg-muted/50 mb-4 max-h-40 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 text-sm">
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md object-cover" />
              <span className="flex-1 truncate">{item.name} × {item.quantity}</span>
              <span className="font-medium text-zw-green">{formatPi(item.pricePi * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-border/40 font-bold">
            <span>Products</span>
            <span className="text-zw-green">{formatPi(cartProductAmount)}</span>
          </div>
        </div>

        {/* Hub fee breakdown */}
        {!isDirect && feeResult && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Breakdown</div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products (to sellers)</span>
                <span className="font-medium">{formatPi(cartProductAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Hub fee to {hub?.name}
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
              <span className="font-bold text-lg text-zw-green">{formatPi(grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Escrow info message */}
        {!isDirect && feeResult && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-zw-green/5 border border-zw-green/20 mb-4">
            <ShieldCheck className="h-4 w-4 text-zw-green shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              You pay once. Escrow holds the product amount for the seller and the hub fee for the hub. Both are released when you confirm delivery.
            </p>
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
            disabled={loading || !!sdkError}
            className="w-full h-14 bg-zw-green hover:bg-zw-green-600 text-white rounded-xl text-lg font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-1.5 animate-spin" /> Loading Pi SDK…
              </>
            ) : sdkError ? (
              'Pi SDK unavailable'
            ) : isDirect ? (
              <>
                <Wallet className="h-5 w-5 mr-1.5" /> Pay {formatPi(cartProductAmount)}
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-1.5" /> Pay {formatPi(grandTotal)} Once — Goods + Hub
              </>
            )}
          </Button>
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
              Continue Shopping
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
