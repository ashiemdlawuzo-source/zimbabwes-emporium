'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { formatPi, timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Phone,
  MessageCircle,
  Building2,
  Package,
  Wallet,
  CircleCheck,
  Truck,
  ArrowRight,
  Clock,
  KeyRound,
  Camera,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  MapPinned,
} from 'lucide-react';
import { HUBS, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-zw-green/10 text-zw-green border-zw-green/20' },
  at_hub: { label: 'At Hub', color: 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30' },
  delivered_pending: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  delivered: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  disputed: { label: 'Disputed', color: 'bg-zw-red/10 text-zw-red border-zw-red/20' },
  completed: { label: 'Completed', color: 'bg-zw-green/15 text-zw-green-700 border-zw-green/30' },
};

type DeliveryStep = 'idle' | 'photo' | 'code' | 'success' | 'error';

export default function HubDashboardPage() {
  const { registeredHubs, orders, updateOrderStatus, updateOrder, verifyDeliveryCode, approveHub } = useApp();
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryStep, setDeliveryStep] = useState<DeliveryStep>('idle');
  const [deliveryPhoto, setDeliveryPhoto] = useState<string>('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [gps, setGps] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myHubs = registeredHubs;
  const selectedHub = myHubs.find((h) => h.id === selectedHubId);

  const hubCityMap = new Map(HUBS.map((h) => [h.name.toLowerCase(), h.id]));

  const hubOrders = selectedHub
    ? orders.filter((o) => {
        const hubInfo = HUBS.find((h) => h.id === o.hubId);
        return hubInfo?.name === selectedHub.city || o.hubId === selectedHub.id;
      })
    : [];

  const allHubOrders = orders.filter((o) => {
    const hubInfo = HUBS.find((h) => h.id === o.hubId);
    return myHubs.some((mh) => mh.city === hubInfo?.name);
  });

  const totalEarnings = hubOrders.length * (selectedHub?.feePi ?? 0);
  const deliveredCount = hubOrders.filter((o) => o.status === 'delivered_pending' || o.status === 'delivered' || o.status === 'completed').length;
  const atHubCount = hubOrders.filter((o) => o.status === 'at_hub').length;
  const disputedCount = hubOrders.filter((o) => o.status === 'disputed').length;

  const startDelivery = (orderId: string) => {
    setDeliveryOrderId(orderId);
    setDeliveryStep('photo');
    setDeliveryPhoto('');
    setCodeInput('');
    setCodeError('');
    setGps('');
    // Try to get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
        () => setGps(''),
        { timeout: 5000 }
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDeliveryPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = () => {
    if (!deliveryPhoto) return;
    setDeliveryStep('code');
  };

  const handleCodeSubmit = () => {
    if (!deliveryOrderId) return;
    if (verifyDeliveryCode(deliveryOrderId, codeInput)) {
      updateOrder(deliveryOrderId, {
        status: 'delivered_pending',
        deliveryPhoto,
        deliveredAt: Date.now(),
        gps: gps || undefined,
      });
      setDeliveryStep('success');
    } else {
      setCodeError('Wrong code. Ask the buyer for their delivery code.');
      setDeliveryStep('error');
    }
  };

  const closeDelivery = () => {
    setDeliveryOrderId(null);
    setDeliveryStep('idle');
    setDeliveryPhoto('');
    setCodeInput('');
    setCodeError('');
    setGps('');
  };

  if (myHubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Hub Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          You haven&rsquo;t registered a delivery hub yet. Register one to start receiving orders and earning Pi.
        </p>
        <Link href="/hub/register">
          <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11 px-6">
            Register a Hub <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  const deliveryOrder = deliveryOrderId ? orders.find((o) => o.id === deliveryOrderId) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">Hub Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage orders and track earnings at your hub</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/disputes">
            <Button variant="outline" className="rounded-full h-10">
              <AlertTriangle className="h-4 w-4 mr-1" /> View Disputes
              {disputedCount > 0 && (
                <Badge className="ml-1.5 bg-zw-red text-white text-[10px] px-1.5 py-0">{disputedCount}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/hub/register">
            <Button variant="outline" className="rounded-full h-10">
              <Building2 className="h-4 w-4 mr-1" /> Register Another Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Hub selector */}
      <div className="mb-6">
        <Select value={selectedHubId} onValueChange={setSelectedHubId}>
          <SelectTrigger className="h-11 rounded-xl max-w-xs">
            <SelectValue placeholder="Select your hub to view orders" />
          </SelectTrigger>
          <SelectContent>
            {myHubs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name} — {h.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedHub && (
        <>
          {/* Hub status banner */}
          <Card className={cn(
            'p-4 mb-6 border',
            selectedHub.status === 'approved'
              ? 'border-zw-green/30 bg-zw-green/5'
              : 'border-zw-yellow/30 bg-zw-yellow/5'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{selectedHub.name}</span>
                  <Badge variant="outline" className={cn(
                    'text-xs',
                    selectedHub.status === 'approved'
                      ? 'bg-zw-green/10 text-zw-green border-zw-green/20'
                      : 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
                  )}>
                    {selectedHub.status === 'approved' ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedHub.city} · {selectedHub.address}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-zw-green">{formatPi(selectedHub.feePi)}</div>
                <div className="text-xs text-muted-foreground">per delivery</div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-zw-green" />
                <span className="text-xs text-muted-foreground">Orders</span>
              </div>
              <div className="text-2xl font-bold font-heading">{hubOrders.length}</div>
            </Card>
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-zw-yellow-600" />
                <span className="text-xs text-muted-foreground">At Hub</span>
              </div>
              <div className="text-2xl font-bold font-heading text-zw-yellow-600">{atHubCount}</div>
            </Card>
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <CircleCheck className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Delivered</span>
              </div>
              <div className="text-2xl font-bold font-heading text-blue-600">{deliveredCount}</div>
            </Card>
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-zw-green" />
                <span className="text-xs text-muted-foreground">Earnings</span>
              </div>
              <div className="text-2xl font-bold font-heading text-zw-green">
                {formatPi(hubOrders.reduce((sum, o) => sum + (o.hubFee ?? 0), 0))}
              </div>
            </Card>
          </div>

          {/* Orders */}
          <h2 className="font-heading text-lg font-bold mb-3">Orders at Your Hub</h2>
          {hubOrders.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders assigned to your hub yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {hubOrders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <Card key={order.id} className="p-4 border-border/60">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/orders/${order.id}`} className="font-mono text-sm font-bold hover:text-zw-green transition-colors">
                            {order.id}
                          </Link>
                          <Badge variant="outline" className={cn('text-xs', status.color)}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(order.createdAt)} · {order.buyerName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                        </p>
                        {/* Hub fee + distance + goods info */}
                        {order.hubFee != null && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-zw-green/10 text-zw-green font-semibold">
                              You earn: {formatPi(order.hubFee)}
                            </span>
                            {order.distanceKm != null && (
                              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {order.distanceKm}km
                              </span>
                            )}
                            {order.goodsType && (
                              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                {order.goodsType} parcel
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hub actions */}
                    <div className="flex gap-2 pt-3 border-t border-border/40 flex-wrap">
                      {order.status === 'paid' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'at_hub')}
                          size="sm"
                          className="bg-zw-yellow-600 hover:bg-zw-yellow-700 text-white rounded-full h-9"
                        >
                          <MapPin className="h-3.5 w-3.5 mr-1" /> Accept — Earn {order.hubFee != null ? formatPi(order.hubFee) : formatPi(selectedHub.feePi)}
                        </Button>
                      )}
                      {order.status === 'at_hub' && (
                        <Button
                          onClick={() => startDelivery(order.id)}
                          size="sm"
                          className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-9"
                        >
                          <CircleCheck className="h-3.5 w-3.5 mr-1" /> Complete Delivery
                        </Button>
                      )}
                      {order.status === 'delivered_pending' && (
                        <Badge className="bg-blue-50 text-blue-600 border border-blue-200">
                          <Clock className="h-3.5 w-3.5 mr-1" /> Awaiting Buyer Confirmation
                        </Badge>
                      )}
                      {order.status === 'completed' && (
                        <Badge className="bg-zw-green/15 text-zw-green-700 border border-zw-green/30">
                          <CircleCheck className="h-3.5 w-3.5 mr-1" /> Completed
                        </Badge>
                      )}
                      {order.status === 'disputed' && (
                        <Badge className="bg-zw-red/10 text-zw-red border border-zw-red/20">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Disputed
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {!selectedHub && (
        <Card className="p-8 text-center border-dashed">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a hub above to view its orders.</p>
        </Card>
      )}

      {/* Delivery completion flow modal */}
      {deliveryOrderId && deliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={closeDelivery}>
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Step: Photo */}
            {deliveryStep === 'photo' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="h-5 w-5 text-zw-green" />
                  <h2 className="font-heading text-lg font-bold">Step 1: Upload Delivery Photo</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo of the delivered items as proof of delivery for order <span className="font-mono font-bold">{deliveryOrder.id}</span>.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {deliveryPhoto ? (
                  <div className="mb-4">
                    <img src={deliveryPhoto} alt="Delivery proof" className="w-full rounded-xl object-cover max-h-48" />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full mt-2 rounded-full"
                    >
                      Retake Photo
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:border-zw-green/40 hover:bg-zw-green/5 transition-colors"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Click to upload or take photo</span>
                  </button>
                )}
                {gps && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPinned className="h-3.5 w-3.5 text-zw-green" /> GPS: {gps}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePhotoSubmit}
                    disabled={!deliveryPhoto}
                    className="flex-1 bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11"
                  >
                    Continue
                  </Button>
                  <Button onClick={closeDelivery} variant="outline" className="rounded-full h-11">
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Step: Code */}
            {deliveryStep === 'code' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="h-5 w-5 text-zw-green" />
                  <h2 className="font-heading text-lg font-bold">Step 2: Enter Buyer&rsquo;s Code</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask the buyer for their 4-digit delivery code. They can find it in their My Orders page.
                </p>
                <Input
                  value={codeInput}
                  onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); setDeliveryStep('code'); }}
                  placeholder="Enter 4-digit code"
                  className="h-14 rounded-xl text-center text-2xl font-mono tracking-widest"
                  maxLength={4}
                  inputMode="numeric"
                />
                {codeError && (
                  <p className="text-sm text-zw-red mt-2 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> {codeError}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleCodeSubmit}
                    disabled={codeInput.length !== 4}
                    className="flex-1 bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11"
                  >
                    Verify & Complete
                  </Button>
                  <Button onClick={() => setDeliveryStep('photo')} variant="outline" className="rounded-full h-11">
                    Back
                  </Button>
                </div>
              </>
            )}

            {/* Step: Success */}
            {deliveryStep === 'success' && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-16 w-16 text-zw-green mx-auto mb-4" />
                <h2 className="font-heading text-lg font-bold mb-2">Delivery Confirmed!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Order <span className="font-mono font-bold">{deliveryOrder.id}</span> marked as delivered.
                  Buyer has 24 hours to confirm or dispute before Pi is released.
                </p>
                <Button onClick={closeDelivery} className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11 px-8">
                  Done
                </Button>
              </div>
            )}

            {/* Step: Error */}
            {deliveryStep === 'error' && (
              <div className="text-center py-4">
                <XCircle className="h-16 w-16 text-zw-red mx-auto mb-4" />
                <h2 className="font-heading text-lg font-bold mb-2">Wrong Code</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  The code you entered doesn&rsquo;t match. Ask the buyer to show their delivery code from the My Orders page.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setDeliveryStep('code'); setCodeError(''); }}
                    className="flex-1 bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11"
                  >
                    Try Again
                  </Button>
                  <Button onClick={closeDelivery} variant="outline" className="rounded-full h-11">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
