'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { useMarket } from '@/lib/market-context';
import { formatPi, timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Package,
  MapPin,
  Wallet,
  CircleCheck,
  Truck,
  Send,
  MessageCircle,
  Store,
  Phone,
  ShieldCheck,
  KeyRound,
  Clock,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { OrderStatus, ChatMessage, DeliveryType } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-zw-green/10 text-zw-green border-zw-green/20' },
  at_hub: { label: 'At Hub', color: 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30' },
  delivered_pending: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  delivered: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  disputed: { label: 'Disputed', color: 'bg-zw-red/10 text-zw-red border-zw-red/20' },
  completed: { label: 'Completed', color: 'bg-zw-green/15 text-zw-green-700 border-zw-green/30' },
};

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { getOrder, getOrderChats, sendMessage, piUser, updateOrderStatus, confirmReceipt, reportProblem } = useApp();
  const { sellers } = useMarket();
  const [chatInput, setChatInput] = useState('');
  const [disputeMode, setDisputeMode] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const order = getOrder(orderId);
  const chats = order ? getOrderChats(order.id) : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground mb-6">This order may have been removed.</p>
        <Link href="/orders">
          <Button className="bg-zw-green text-white rounded-full">View All Orders</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const isDirect = order.deliveryType === 'direct';
  const isDeliveredPending = order.status === 'delivered_pending';
  const hoursSinceDelivery = order.deliveredAt ? Math.floor((Date.now() - order.deliveredAt) / (60 * 60 * 1000)) : 0;
  const hoursLeft = order.deliveredAt ? Math.max(0, 24 - hoursSinceDelivery) : 0;

  const handleSendMessage = () => {
    if (!chatInput.trim() || !piUser) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId: order.id,
      sender: piUser.username,
      senderRole: 'buyer',
      message: chatInput.trim(),
      createdAt: Date.now(),
    };
    sendMessage(msg);
    setChatInput('');
  };

  const handleConfirmReceipt = () => {
    confirmReceipt(order.id);
  };

  const handleReportProblem = () => {
    if (disputeReason.trim()) {
      reportProblem(order.id, disputeReason.trim());
      setDisputeMode(false);
      setDisputeReason('');
    }
  };

  const orderSellers = order.items
    .map((item) => sellers.find((s) => s.id === item.sellerId))
    .filter((s, i, arr) => s && arr.findIndex((x) => x?.id === s?.id) === i);

  const statusSteps = isDirect
    ? [
        { icon: Wallet, label: 'Payment Confirmed', desc: `Pi payment received (ID: ${order.paymentId.slice(0, 12)}…)`, done: true },
        { icon: Truck, label: 'Direct Delivery', desc: 'Seller delivers directly to buyer. Contact seller to arrange delivery.', done: order.status === 'delivered' || order.status === 'delivered_pending' || order.status === 'completed' },
        { icon: CircleCheck, label: 'Delivered', desc: 'Order confirmed as delivered.', done: order.status === 'delivered' || order.status === 'completed' },
      ]
    : [
        { icon: Wallet, label: 'Payment Confirmed', desc: `Pi payment received (ID: ${order.paymentId.slice(0, 12)}…)`, done: true },
        { icon: MapPin, label: `At Hub — ${order.hubName}`, desc: 'Order received at delivery hub. Ready for pickup or dispatch.', done: order.status === 'at_hub' || order.status === 'delivered_pending' || order.status === 'delivered' || order.status === 'completed' || order.status === 'disputed' },
        { icon: CircleCheck, label: 'Delivered', desc: 'Order delivered and confirmed by hub.', done: order.status === 'delivered_pending' || order.status === 'delivered' || order.status === 'completed' || order.status === 'disputed' },
        ...(order.status === 'completed' ? [{ icon: CircleCheck, label: 'Completed', desc: 'Pi released to seller. Transaction complete.', done: true }] : []),
        ...(order.status === 'disputed' ? [{ icon: AlertTriangle, label: 'Disputed', desc: order.disputeReason || 'Buyer reported a problem.', done: true }] : []),
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold font-mono">{order.id}</h1>
            <Badge variant="outline" className={cn('text-xs', status.color)}>
              {status.label}
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
          <p className="text-sm text-muted-foreground">
            Placed {timeAgo(order.createdAt)} · {order.buyerName}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zw-green font-heading">
            {formatPi(order.totalPi)}
          </div>
          <div className="text-xs text-muted-foreground">{order.items.length} item(s)</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment breakdown card */}
          {!isDirect && order.productAmount != null && order.hubFee != null && (
            <Card className="p-5 border-zw-green/30 bg-zw-green/5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-zw-green" /> Payment Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product (to seller)</span>
                  <span className="font-medium">{formatPi(order.productAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hub fee (to {order.hubName})</span>
                  <span className="font-medium">{formatPi(order.hubFee)}</span>
                </div>
                {order.distanceKm != null && order.goodsType && (
                  <div className="text-[11px] text-muted-foreground/70 pl-2">
                    {order.distanceKm}km · {order.goodsType === 'large' ? 'Large item' : 'Small parcel'}
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="font-bold text-base">Total paid</span>
                  <span className="font-bold text-lg text-zw-green">{formatPi(order.totalPi)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-zw-green shrink-0 mt-0.5" />
                <span>You paid once. Escrow holds the product amount for the seller and the hub fee for the hub. Both are released when you confirm delivery.</span>
              </div>
            </Card>
          )}

          {/* Delivery code card */}
          {!isDirect && order.deliveryCode && order.status !== 'completed' && (
            <Card className="p-5 border-zw-green/30 bg-zw-green/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zw-green flex items-center justify-center shrink-0">
                  <KeyRound className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-zw-green">Your Delivery Code</h3>
                  <p className="text-xs text-muted-foreground mb-1">Show this code to the hub staff when collecting your order.</p>
                  <div className="text-3xl font-bold font-mono text-zw-green tracking-widest">{order.deliveryCode}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Delivery photo proof */}
          {order.deliveryPhoto && (order.status === 'delivered_pending' || order.status === 'delivered' || order.status === 'completed' || order.status === 'disputed') && (
            <Card className="p-5 border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-zw-green" /> Delivery Photo Proof
              </h3>
              <img src={order.deliveryPhoto} alt="Delivery proof" className="w-full rounded-xl object-cover max-h-64" />
              {order.deliveredAt && (
                <p className="text-xs text-muted-foreground mt-2">Delivered {timeAgo(order.deliveredAt)}</p>
              )}
            </Card>
          )}

          {/* Confirm / Report section */}
          {isDeliveredPending && (
            <Card className="p-5 border-border/60">
              <h3 className="font-semibold mb-1">Confirm Delivery</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hub marked this order as delivered. Please confirm you received it, or report a problem within 24 hours.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                <Clock className="h-3.5 w-3.5" />
                {hoursLeft > 0
                  ? `${hoursLeft}h left to confirm or dispute. Auto-completes after 24h.`
                  : 'Auto-completing soon.'}
              </div>
              {!disputeMode ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmReceipt}
                    className="flex-1 bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11"
                  >
                    <CircleCheck className="h-4 w-4 mr-1.5" /> Confirm Received
                  </Button>
                  <Button
                    onClick={() => setDisputeMode(true)}
                    variant="outline"
                    className="flex-1 border-zw-red/30 text-zw-red hover:bg-zw-red/5 rounded-full h-11"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5" /> Report Problem
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe the problem (e.g. did not receive, wrong items...)"
                    className="h-11 rounded-xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReportProblem}
                      disabled={!disputeReason.trim()}
                      className="flex-1 bg-zw-red hover:bg-zw-red/80 text-white rounded-full h-11"
                    >
                      Submit Dispute
                    </Button>
                    <Button
                      onClick={() => { setDisputeMode(false); setDisputeReason(''); }}
                      variant="outline"
                      className="rounded-full h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Dispute notice */}
          {order.status === 'disputed' && (
            <Card className="p-5 border-zw-red/30 bg-zw-red/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-zw-red" />
                <h3 className="font-semibold text-zw-red">Dispute Open</h3>
              </div>
              <p className="text-sm text-muted-foreground">{order.disputeReason || 'You reported a problem with this order.'}</p>
              <p className="text-xs text-muted-foreground mt-2">Reported {order.disputedAt ? timeAgo(order.disputedAt) : 'recently'}</p>
            </Card>
          )}

          {/* Completed notice */}
          {order.status === 'completed' && (
            <Card className="p-5 border-zw-green/30 bg-zw-green/5">
              <div className="flex items-center gap-2">
                <CircleCheck className="h-5 w-5 text-zw-green" />
                <h3 className="font-semibold text-zw-green">Order Completed</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pi released to seller. Transaction complete.</p>
            </Card>
          )}

          {/* Status timeline */}
          <Card className="p-5 border-border/60">
            <h2 className="font-semibold mb-4">Delivery Status</h2>
            <div className="space-y-4">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      step.done ? 'bg-zw-green text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className={cn('text-sm font-medium', step.done ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Order items */}
          <Card className="p-5 border-border/60">
            <h2 className="font-semibold mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-zw-green text-sm">
                    {formatPi(item.pricePi * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat */}
          <Card className="p-5 border-border/60">
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-zw-green" />
              Buyer-Seller Chat
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {piUser ? `Chatting as ${piUser.username}` : 'Login with Pi to chat with the seller'}
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 p-2 rounded-xl bg-muted/30">
              {chats.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  No messages yet. Start the conversation about pickup or delivery!
                </p>
              ) : (
                chats.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[80%]',
                      msg.senderRole === 'buyer' ? 'ml-auto items-end' : 'mr-auto items-start'
                    )}
                  >
                    <div className={cn(
                      'px-3 py-2 rounded-xl text-sm',
                      msg.senderRole === 'buyer'
                        ? 'bg-zw-green text-white rounded-br-sm'
                        : 'bg-background border border-border/60 rounded-bl-sm'
                    )}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                      {msg.sender} · {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {piUser ? (
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Type a message about pickup or delivery…"
                  className="h-10 rounded-full"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-10 px-4 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-2">
                Sign in with Pi from the top menu to send messages.
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Delivery info */}
          <Card className="p-4 border-border/60">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
              {isDirect ? (
                <><Truck className="h-4 w-4 text-blue-600" /> Direct Delivery</>
              ) : (
                <><ShieldCheck className="h-4 w-4 text-zw-green" /> Hub Escrow</>
              )}
            </h3>
            {isDirect ? (
              <>
                <div className="text-sm font-medium">Direct to your address</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seller delivers directly. Contact the seller via chat or phone to arrange delivery details.
                </p>
              </>
            ) : (
              <>
                <div className="text-sm font-medium">{order.hubName}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Hub-based escrow delivery. Pi held securely until you confirm receipt.
                </p>
              </>
            )}
          </Card>

          {/* Seller info */}
          {orderSellers.map((seller) => seller && (
            <Card key={seller.id} className="p-4 border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Store className="h-4 w-4 text-zw-green" /> Seller
              </h3>
              <Link href={`/shop/${seller.id}`} className="flex items-center gap-2 group">
                <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-medium group-hover:text-zw-green transition-colors">{seller.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{seller.hub} hub</div>
                </div>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Phone className="h-3 w-3" /> {seller.phone}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
