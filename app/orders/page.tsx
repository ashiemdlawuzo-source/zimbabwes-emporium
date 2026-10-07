'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { formatPi, timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  MapPin,
  Truck,
  CircleCheck,
  Wallet,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Wallet }> = {
  paid: { label: 'Paid', color: 'bg-zw-green/10 text-zw-green border-zw-green/20', icon: Wallet },
  at_hub: { label: 'At Hub', color: 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30', icon: MapPin },
  delivered_pending: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: CircleCheck },
  delivered: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: CircleCheck },
  disputed: { label: 'Disputed', color: 'bg-zw-red/10 text-zw-red border-zw-red/20', icon: AlertTriangle },
  completed: { label: 'Completed', color: 'bg-zw-green/15 text-zw-green-700 border-zw-green/30', icon: CircleCheck },
};

export default function OrdersPage() {
  const { orders } = useApp();

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">No orders yet</h1>
        <p className="text-muted-foreground mb-6">
          When you buy products with Pi, your orders will appear here with delivery tracking.
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
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">My Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {orders.length} order{orders.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          const isDirect = order.deliveryType === 'direct';

          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="p-5 border-border/60 hover:border-zw-green/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold">{order.id}</span>
                      <Badge variant="outline" className={cn('text-xs', status.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        isDirect
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-zw-green/10 text-zw-green border-zw-green/20'
                      )}>
                        {isDirect ? (
                          <><Truck className="h-3 w-3 mr-1" /> Direct</>
                        ) : (
                          <><ShieldCheck className="h-3 w-3 mr-1" /> Hub: {order.hubName} — Escrow</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-zw-green font-heading">
                      {formatPi(order.totalPi)}
                    </div>
                    <div className="text-xs text-muted-foreground">{order.items.length} item(s)</div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-3">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.productId}
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-border/40"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Status timeline */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full',
                    order.status === 'paid' ? 'bg-zw-green/10 text-zw-green font-medium' : 'text-muted-foreground'
                  )}>
                    <Wallet className="h-3 w-3" /> Paid
                  </span>
                  {!isDirect && (
                    <>
                      <span className="text-muted-foreground/40">→</span>
                      <span className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full',
                        (order.status === 'at_hub' || order.status === 'delivered_pending' || order.status === 'delivered' || order.status === 'disputed' || order.status === 'completed') ? 'bg-zw-yellow/10 text-zw-yellow-700 font-medium' : 'text-muted-foreground'
                      )}>
                        <MapPin className="h-3 w-3" /> At Hub ({order.hubName})
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground/40">→</span>
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full',
                    (order.status === 'delivered_pending' || order.status === 'delivered') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-muted-foreground'
                  )}>
                    <CircleCheck className="h-3 w-3" /> Delivered
                  </span>
                  {(order.status === 'completed') && (
                    <>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-zw-green/15 text-zw-green-700 font-medium">
                        <CircleCheck className="h-3 w-3" /> Completed
                      </span>
                    </>
                  )}
                  {(order.status === 'disputed') && (
                    <>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-zw-red/10 text-zw-red font-medium">
                        <AlertTriangle className="h-3 w-3" /> Disputed
                      </span>
                    </>
                  )}
                </div>

                {/* Delivery code for buyer */}
                {!isDirect && order.deliveryCode && order.status !== 'completed' && (
                  <div className="mt-3 p-3 rounded-xl bg-zw-green/5 border border-zw-green/20 flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-zw-green shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-zw-green">Show this code to Hub:</div>
                      <div className="text-2xl font-bold font-mono text-zw-green tracking-widest">{order.deliveryCode}</div>
                    </div>
                  </div>
                )}

                {/* Confirm / Report buttons for delivered_pending */}
                {order.status === 'delivered_pending' && (
                  <div className="mt-3 flex gap-2">
                    <Link href={`/orders/${order.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-9">
                        <CircleCheck className="h-3.5 w-3.5 mr-1" /> Confirm Received
                      </Button>
                    </Link>
                    <Link href={`/orders/${order.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-zw-red/30 text-zw-red hover:bg-zw-red/5 rounded-full h-9">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Report Problem
                      </Button>
                    </Link>
                  </div>
                )}

                {/* 24h timer notice */}
                {order.status === 'delivered_pending' && order.deliveredAt && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Auto-completes in {Math.max(0, 24 - Math.floor((Date.now() - order.deliveredAt) / (60 * 60 * 1000)))}h if no dispute
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
