'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { useMarket } from '@/lib/market-context';
import { formatPi, timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { updateProductStock } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Store,
  MapPin,
  Wallet,
  CircleCheck,
  ArrowRight,
  TrendingUp,
  Minus,
  Plus,
} from 'lucide-react';
import { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-zw-green/10 text-zw-green border-zw-green/20' },
  at_hub: { label: 'At Hub', color: 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30' },
  delivered_pending: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  delivered: { label: 'Delivered', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  disputed: { label: 'Disputed', color: 'bg-zw-red/10 text-zw-red border-zw-red/20' },
  completed: { label: 'Completed', color: 'bg-zw-green/15 text-zw-green-700 border-zw-green/30' },
};

export default function SellerDashboardPage() {
  const { orders, refresh: refreshApp } = useApp();
  const { sellers, products, refresh: refreshMarket } = useMarket();
  const { toast } = useToast();

  const refresh = () => {
    refreshApp();
    refreshMarket();
  };

  // Get all orders that contain items from sellers in our system
  const sellerOrders = orders.filter((order) =>
    order.items.some((item) => sellers.some((s) => s.id === item.sellerId))
  );

  // Calculate earnings
  const totalEarnings = sellerOrders
    .filter((o) => o.status !== 'paid' || true)
    .reduce((sum, o) => sum + o.totalPi, 0);
  const deliveredEarnings = sellerOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPi, 0);

  // Group orders by seller
  const sellerStats = sellers.map((seller) => {
    const sellerOrdersForThisSeller = orders.filter((o) =>
      o.items.some((item) => item.sellerId === seller.id)
    );
    const earnings = sellerOrdersForThisSeller.reduce((sum, o) => sum + o.totalPi, 0);
    const productCount = products.filter((p) => p.sellerId === seller.id).length;
    return { seller, orderCount: sellerOrdersForThisSeller.length, earnings, productCount };
  }).filter((s) => s.orderCount > 0 || s.productCount > 0);

  if (sellerStats.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Store className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          No orders yet. Register a shop and list products to start receiving orders.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sell">
            <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11 px-6">
              Register a Shop
            </Button>
          </Link>
          <Link href="/sell/upload">
            <Button variant="outline" className="rounded-full h-11 px-6">
              Upload a Product
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">Seller Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Track orders and earnings across your shops</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-zw-green" />
            <span className="text-xs text-muted-foreground">Total Orders</span>
          </div>
          <div className="text-2xl font-bold font-heading">{sellerOrders.length}</div>
        </Card>
        <Card className="p-4 border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-zw-green" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold font-heading text-zw-green">{formatPi(totalEarnings)}</div>
        </Card>
        <Card className="p-4 border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <CircleCheck className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Delivered</span>
          </div>
          <div className="text-2xl font-bold font-heading text-blue-600">{formatPi(deliveredEarnings)}</div>
        </Card>
      </div>

      {/* Shops overview */}
      <div className="mb-6">
        <h2 className="font-heading text-lg font-bold mb-3">Your Shops</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sellerStats.map(({ seller, orderCount, earnings, productCount }) => (
            <Link key={seller.id} href={`/shop/${seller.id}`}>
              <Card className="p-4 border-border/60 hover:border-zw-green/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{seller.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{seller.hub} hub</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{productCount} products</span>
                  <span className="text-muted-foreground">{orderCount} orders</span>
                </div>
                {earnings > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <span className="text-sm font-bold text-zw-green">{formatPi(earnings)}</span>
                    <span className="text-xs text-muted-foreground ml-1">earned</span>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Products with stock management */}
      <div className="mb-6">
        <h2 className="font-heading text-lg font-bold mb-3">Your Products — Stock Management</h2>
        <div className="space-y-2">
          {products.map((product) => {
            const stock = product.stockQuantity ?? 100;
            return (
              <Card key={product.id} className="p-4 border-border/60">
                <div className="flex items-center gap-4">
                  <Link href={`/product/${product.id}`} className="shrink-0">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium text-sm hover:text-zw-green transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatPi(product.pricePi)} · {product.category}
                    </div>
                  </div>
                  {/* Stock editor */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border',
                      stock === 0
                        ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                        : stock < 3
                          ? 'bg-zw-red/10 text-zw-red border-zw-red/20'
                          : stock < 10
                            ? 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
                            : 'bg-zw-green/10 text-zw-green border-zw-green/20'
                    )}>
                      {stock === 0 ? 'Out of stock' : `${stock} in stock`}
                    </span>
                    <button
                      onClick={() => {
                        const newStock = Math.max(0, stock - 1);
                        updateProductStock(product.id, newStock);
                        toast({ title: 'Stock updated', description: `${product.name}: ${newStock} in stock` });
                        refresh();
                      }}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      value={stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateProductStock(product.id, Math.max(0, val));
                        refresh();
                      }}
                      className="w-16 h-7 text-center text-sm p-0"
                    />
                    <button
                      onClick={() => {
                        const newStock = stock + 1;
                        updateProductStock(product.id, newStock);
                        toast({ title: 'Stock updated', description: `${product.name}: ${newStock} in stock` });
                        refresh();
                      }}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <h2 className="font-heading text-lg font-bold mb-3">All Orders</h2>
      {sellerOrders.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders received yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sellerOrders.map((order) => {
            const status = statusConfig[order.status];
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="p-4 border-border/60 hover:border-zw-green/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold">{order.id}</span>
                        <Badge variant="outline" className={cn('text-xs', status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {timeAgo(order.createdAt)} · {order.buyerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-zw-green">{formatPi(order.totalPi)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                        <MapPin className="h-3 w-3" /> {order.hubName}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
