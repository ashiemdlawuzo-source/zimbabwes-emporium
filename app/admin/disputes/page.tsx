'use client';

import { useApp } from '@/lib/app-context';
import { useMarket } from '@/lib/market-context';
import { formatPi, timeAgo } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Camera,
  KeyRound,
  Clock,
  MapPinned,
  Package,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDisputesPage() {
  const { orders, updateOrderStatus, updateOrder } = useApp();
  const { sellers } = useMarket();

  const disputedOrders = orders.filter((o) => o.status === 'disputed');

  const handleResolve = (orderId: string, release: boolean) => {
    if (release) {
      updateOrder(orderId, { status: 'completed', confirmedAt: Date.now() });
    } else {
      updateOrder(orderId, { status: 'paid' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/hub/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Hub Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zw-red/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-zw-red" />
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">Dispute Resolution</h1>
          <p className="text-sm text-muted-foreground">
            {disputedOrders.length} disputed order{disputedOrders.length !== 1 ? 's' : ''} requiring review
          </p>
        </div>
      </div>

      {disputedOrders.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CheckCircle2 className="h-12 w-12 text-zw-green mx-auto mb-4" />
          <h2 className="font-heading text-lg font-bold mb-2">No Disputes</h2>
          <p className="text-muted-foreground">All orders are proceeding smoothly. No disputes to resolve.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputedOrders.map((order) => {
            const orderSellers = order.items
              .map((item) => sellers.find((s) => s.id === item.sellerId))
              .filter((s, i, arr) => s && arr.findIndex((x) => x?.id === s?.id) === i);
            return (
              <Card key={order.id} className="p-5 border-zw-red/30">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold">{order.id}</span>
                      <Badge className="bg-zw-red/10 text-zw-red border border-zw-red/20">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Disputed
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buyer: {order.buyerName} · {formatPi(order.totalPi)} · Placed {timeAgo(order.createdAt)}
                    </p>
                    {order.disputedAt && (
                      <p className="text-xs text-zw-red mt-0.5">
                        Disputed {timeAgo(order.disputedAt)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-zw-green">{formatPi(order.totalPi)}</div>
                    <div className="text-xs text-muted-foreground">{order.items.length} item(s)</div>
                  </div>
                </div>

                {/* Dispute reason */}
                <div className="mb-4 p-3 rounded-xl bg-zw-red/5 border border-zw-red/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-zw-red" />
                    <span className="text-xs font-semibold text-zw-red">Buyer&rsquo;s Report:</span>
                  </div>
                  <p className="text-sm text-foreground">{order.disputeReason || 'No reason provided.'}</p>
                </div>

                {/* Evidence grid */}
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {/* Photo proof */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Camera className="h-4 w-4 text-zw-green" />
                      <span className="text-xs font-semibold">Delivery Photo</span>
                    </div>
                    {order.deliveryPhoto ? (
                      <img src={order.deliveryPhoto} alt="Delivery proof" className="w-full rounded-lg object-cover max-h-40" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground/60">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs">No photo uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Code + timestamp + GPS log */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <KeyRound className="h-4 w-4 text-zw-green" />
                        <span className="text-xs font-semibold">Delivery Code</span>
                      </div>
                      <span className="text-lg font-bold font-mono text-zw-green tracking-widest">
                        {order.deliveryCode || 'N/A'}
                      </span>
                    </div>
                    {order.deliveredAt && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-semibold">Delivery Time</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.deliveredAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    )}
                    {order.gps && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPinned className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-semibold">GPS Location</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{order.gps}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold">Items in Order</span>
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 text-sm">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md object-cover" />
                        <span className="flex-1 truncate">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-zw-green text-xs">{formatPi(item.pricePi * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller info */}
                {orderSellers.map((seller) => seller && (
                  <div key={seller.id} className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Seller: {seller.name} ({seller.phone})
                  </div>
                ))}

                {/* Resolution actions */}
                <div className="pt-4 border-t border-border/40 flex gap-2">
                  <Button
                    onClick={() => handleResolve(order.id, true)}
                    size="sm"
                    className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-9"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Release Pi to Seller
                  </Button>
                  <Button
                    onClick={() => handleResolve(order.id, false)}
                    size="sm"
                    variant="outline"
                    className="border-zw-red/30 text-zw-red hover:bg-zw-red/5 rounded-full h-9"
                  >
                    Refund Buyer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
