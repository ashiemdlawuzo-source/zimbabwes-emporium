'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/lib/market-context';
import { saveProduct } from '@/lib/storage';
import { Product, HUBS, CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GcvBadge } from '@/components/gcv-badge';
import {
  Image as ImageIcon,
  Tag,
  MapPin,
  ArrowRight,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPi, formatGcv } from '@/lib/format';

export default function UploadPage() {
  const router = useRouter();
  const { sellers, refresh } = useMarket();

  const [sellerId, setSellerId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePi, setPricePi] = useState('');
  const [image, setImage] = useState('');
  const [gcvSupported, setGcvSupported] = useState(false);
  const [hub, setHub] = useState('harare');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === sellerId),
    [sellers, sellerId]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!sellerId) errs.sellerId = 'Select a shop first';
    if (!name.trim()) errs.name = 'Product name is required';
    if (!description.trim()) errs.description = 'Description is required';
    const price = parseFloat(pricePi);
    if (!pricePi || isNaN(price) || price <= 0) errs.pricePi = 'Enter a valid Pi price';
    if (!image) errs.image = 'Upload a product photo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const product: Product = {
      id: `prod-${Date.now()}`,
      sellerId,
      name: name.trim(),
      description: description.trim(),
      pricePi: parseFloat(pricePi),
      image,
      gcvSupported,
      hub,
      category,
      createdAt: Date.now(),
    };
    saveProduct(product);
    refresh();
    router.push(`/product/${product.id}`);
  };

  const priceNum = parseFloat(pricePi) || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green/10 text-zw-green text-sm font-medium mb-4">
          <Package className="h-4 w-4" />
          List a product
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          Upload a product
        </h1>
        <p className="text-muted-foreground">
          Set your price in Pi. Toggle GCV to show the green badge of trust.
        </p>
      </div>

      {sellers.length === 0 ? (
        <Card className="p-8 text-center border-dashed animate-fade-up">
          <p className="text-muted-foreground mb-4">
            You need to register a shop first before listing products.
          </p>
          <Button
            onClick={() => router.push('/sell')}
            className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full"
          >
            Register your shop
          </Button>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 border-border/60 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select shop */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Select your shop</Label>
              <div className="space-y-2">
                {sellers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSellerId(s.id); setHub(s.hub); }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      sellerId === s.id
                        ? 'border-zw-green bg-zw-green-50'
                        : 'border-border/60 hover:border-zw-green/30'
                    )}
                  >
                    <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{s.hub}</div>
                    </div>
                    {sellerId === s.id && <ShieldCheck className="h-5 w-5 text-zw-green" />}
                  </button>
                ))}
              </div>
              {errors.sellerId && <p className="text-xs text-zw-red mt-1">{errors.sellerId}</p>}
            </div>

            {/* Product photo */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Product photo</Label>
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Product preview"
                    className="w-full aspect-[4/3] rounded-xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-zw-green/40 hover:bg-zw-green-50/30 transition-colors">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              {errors.image && <p className="text-xs text-zw-red mt-1">{errors.image}</p>}
            </div>

            {/* Product name */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
                <Tag className="h-4 w-4 text-zw-green" /> Product name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Tomatoes — 5kg Box"
                className="h-11"
              />
              {errors.name && <p className="text-xs text-zw-red mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold mb-1.5 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product…"
                rows={3}
              />
              {errors.description && <p className="text-xs text-zw-red mt-1">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-semibold mb-1.5 block">
                Price in Pi
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pricePi}
                  onChange={(e) => setPricePi(e.target.value)}
                  placeholder="0.5"
                  className="h-11 pr-12 text-lg font-semibold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zw-green">
                  π
                </span>
              </div>
              {errors.pricePi && <p className="text-xs text-zw-red mt-1">{errors.pricePi}</p>}
              {priceNum > 0 && (
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="font-semibold text-zw-green">{formatPi(priceNum)}</span>
                  {gcvSupported && (
                    <span className="text-muted-foreground">= GCV {formatGcv(priceNum)}</span>
                  )}
                </div>
              )}
            </div>

            {/* GCV toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zw-green-50 border border-zw-green/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zw-green flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    GCV Supported
                    {gcvSupported && <GcvBadge size="sm" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Show the green badge — $314,159 = 1 Pi
                  </div>
                </div>
              </div>
              <Switch
                checked={gcvSupported}
                onCheckedChange={setGcvSupported}
                className="data-[state=checked]:bg-zw-green"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                      category === cat
                        ? 'bg-zw-green text-white border-zw-green'
                        : 'border-border/60 hover:border-zw-green/30 text-foreground'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Hub */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
                <MapPin className="h-4 w-4 text-zw-green" /> Delivery hub
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HUBS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHub(h.id)}
                    className={cn(
                      'px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left',
                      hub === h.id
                        ? 'border-zw-green bg-zw-green-50 text-zw-green'
                        : 'border-border/60 hover:border-zw-green/30'
                    )}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-zw-green hover:bg-zw-green-600 text-white rounded-full text-base font-semibold"
            >
              List Product <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
