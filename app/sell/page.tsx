'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/lib/market-context';
import { saveSeller } from '@/lib/storage';
import { Seller, ShopType, SHOP_TYPE_LABELS, SHOP_TYPE_DESCRIPTIONS, HUBS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Store,
  User,
  MapPin,
  Phone,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SellPage() {
  const router = useRouter();
  const { refresh } = useMarket();
  const [name, setName] = useState('');
  const [type, setType] = useState<ShopType>('individual');
  const [bio, setBio] = useState('');
  const [hub, setHub] = useState('harare');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const typeOptions: { value: ShopType; icon: typeof Store; label: string; desc: string }[] = [
    { value: 'big_shop', icon: Store, label: SHOP_TYPE_LABELS.big_shop, desc: SHOP_TYPE_DESCRIPTIONS.big_shop },
    { value: 'tuckshop', icon: Store, label: SHOP_TYPE_LABELS.tuckshop, desc: SHOP_TYPE_DESCRIPTIONS.tuckshop },
    { value: 'individual', icon: User, label: SHOP_TYPE_LABELS.individual, desc: SHOP_TYPE_DESCRIPTIONS.individual },
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Shop name is required';
    if (!bio.trim()) errs.bio = 'Tell us about your shop';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const seller: Seller = {
      id: `seller-${Date.now()}`,
      name: name.trim(),
      type,
      bio: bio.trim(),
      avatar: avatar || 'https://images.pexels.com/photos/36467780/pexels-photo-36467780.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      hub,
      phone: phone.trim(),
      createdAt: Date.now(),
    };
    saveSeller(seller);
    refresh();
    router.push(`/shop/${seller.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green/10 text-zw-green text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Everyone is a shop
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          Register your shop
        </h1>
        <p className="text-muted-foreground">
          Big shop, tuckshop, or individual seller — everyone&rsquo;s welcome.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-border/60 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop type */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">What type of shop?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    type === opt.value
                      ? 'border-zw-green bg-zw-green-50 shadow-sm'
                      : 'border-border/60 hover:border-zw-green/30'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    type === opt.value ? 'bg-zw-green text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                  {type === opt.value && (
                    <Check className="h-4 w-4 text-zw-green mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Shop name */}
          <div>
            <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block">Shop name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amai Grace's Tuckshop"
              className="h-11"
            />
            {errors.name && <p className="text-xs text-zw-red mt-1">{errors.name}</p>}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-sm font-semibold mb-1.5 block">About your shop</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers what you sell and what makes your shop special…"
              rows={3}
            />
            {errors.bio && <p className="text-xs text-zw-red mt-1">{errors.bio}</p>}
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

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
              <Phone className="h-4 w-4 text-zw-green" /> Phone number
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+263 77 123 4567"
              className="h-11"
            />
            {errors.phone && <p className="text-xs text-zw-red mt-1">{errors.phone}</p>}
          </div>

          {/* Avatar */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Shop photo (optional)</Label>
            <div className="flex items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Shop preview"
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Upload photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-zw-green hover:bg-zw-green-600 text-white rounded-full text-base font-semibold"
          >
            Register Shop <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
