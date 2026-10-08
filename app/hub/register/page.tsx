'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { RegisteredHub, HubType, TransportType, ZIM_PROVINCES, ZIM_DISTRICTS, TRANSPORT_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
  ArrowRight,
  Check,
  Wallet,
  ArrowLeft,
  Globe,
  Home,
  Truck,
  Bus,
  Bike,
  Footprints,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPi } from '@/lib/format';

const transportIconMap: Record<TransportType, typeof Truck> = {
  truck: Truck,
  bus: Bus,
  bicycle: Bike,
  foot: Footprints,
};

export default function HubRegisterPage() {
  const router = useRouter();
  const { saveHub } = useApp();
  const [hubType, setHubType] = useState<HubType | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [feePi, setFeePi] = useState('0.02');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Country hub fields
  const [isCountryWide, setIsCountryWide] = useState(false);
  const [provincesCovered, setProvincesCovered] = useState<string[]>([]);
  const [transportType, setTransportType] = useState<TransportType>('truck');

  // Local hub fields
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [village, setVillage] = useState('');
  const [suburb, setSuburb] = useState('');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState('10');

  const toggleProvince = (prov: string) => {
    setProvincesCovered((prev) =>
      prev.includes(prov) ? prev.filter((p) => p !== prov) : [...prev, prov]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!hubType) errs.hubType = 'Select a hub type';
    if (!name.trim()) errs.name = 'Hub name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required';
    const fee = parseFloat(feePi);
    if (isNaN(fee) || fee < 0) errs.feePi = 'Enter a valid fee';

    if (hubType === 'country') {
      if (!isCountryWide && provincesCovered.length === 0) {
        errs.provinces = 'Select at least one province or choose country-wide';
      }
    } else if (hubType === 'local') {
      if (!province) errs.province = 'Select your province';
      if (!district) errs.district = 'Select your district';
      if (!village.trim() && !suburb.trim()) {
        errs.village = 'Enter your village or suburb name';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !hubType) return;
    setSubmitting(true);

    const locationDesc = hubType === 'country'
      ? (isCountryWide ? 'Zimbabwe-wide' : provincesCovered.join(', '))
      : [village || suburb, district, province].filter(Boolean).join(', ');

    const hub: RegisteredHub = {
      id: `hub-${Date.now()}`,
      name: name.trim(),
      city: hubType === 'local' ? (village || suburb || district) : (isCountryWide ? 'Zimbabwe' : provincesCovered[0]),
      address: locationDesc,
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      description: description.trim() || `Delivery hub in ${locationDesc}`,
      feePi: parseFloat(feePi),
      status: 'approved', // Auto-approve for Testnet
      createdAt: Date.now(),
      hubType,
      province: hubType === 'local' ? province : undefined,
      district: hubType === 'local' ? district : undefined,
      ward: hubType === 'local' ? ward.trim() || undefined : undefined,
      village: hubType === 'local' ? village.trim() || undefined : undefined,
      suburb: hubType === 'local' ? suburb.trim() || undefined : undefined,
      coverageRadiusKm: hubType === 'local' ? parseInt(coverageRadiusKm) || 10 : undefined,
      transportType,
      isCountryWide: hubType === 'country' ? isCountryWide : undefined,
      provincesCovered: hubType === 'country' && !isCountryWide ? provincesCovered : undefined,
    };

    saveHub(hub);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push('/hubs'), 2500);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zw-green/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
          <Check className="h-10 w-10 text-zw-green" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Hub Registered!</h1>
        <p className="text-muted-foreground mb-4">
          Your {hubType === 'country' ? 'Country' : 'Village'} Hub &ldquo;{name}&rdquo; is now live and visible to buyers.
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to hubs list...</p>
      </div>
    );
  }

  // Step 1: Choose hub type
  if (!hubType) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green/10 text-zw-green text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            Delivery Hub Registration
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            What type of hub are you?
          </h1>
          <p className="text-muted-foreground">
            Choose your hub type. Anyone can register - no approval needed.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Country Hub */}
          <button
            onClick={() => setHubType('country')}
            className="text-left group animate-fade-up"
          >
            <Card className="p-8 border-2 border-border/60 hover:border-zw-green hover:shadow-xl transition-all h-full cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-zw-green/10 flex items-center justify-center mb-5 group-hover:bg-zw-green group-hover:text-white transition-colors">
                <Globe className="h-8 w-8 text-zw-green group-hover:text-white" />
              </div>
              <h2 className="font-heading text-xl font-bold mb-2">Country Hub</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I deliver long distances, across provinces, across Zimbabwe. I have trucks, buses, or other long-distance transport.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-zw-green">
                Register as Country Hub <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </button>

          {/* Local Village Hub */}
          <button
            onClick={() => setHubType('local')}
            className="text-left group animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <Card className="p-8 border-2 border-border/60 hover:border-zw-green hover:shadow-xl transition-all h-full cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-zw-yellow-50 flex items-center justify-center mb-5 group-hover:bg-zw-yellow-500 group-hover:text-white transition-colors">
                <Home className="h-8 w-8 text-zw-yellow-600 group-hover:text-white" />
              </div>
              <h2 className="font-heading text-xl font-bold mb-2">Local Village Hub</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I deliver in my local area - my village, suburb, or growth point. I know my community and can reach buyers nearby.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-zw-green">
                Register as Village Hub <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Hub details form
  const TransportIcon = transportIconMap[transportType];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <button
        onClick={() => setHubType(null)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Change hub type
      </button>

      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zw-green/10 text-zw-green text-sm font-medium mb-4">
          {hubType === 'country' ? <Globe className="h-4 w-4" /> : <Home className="h-4 w-4" />}
          {hubType === 'country' ? 'Country Hub' : 'Local Village Hub'} Registration
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          {hubType === 'country' ? 'Register Your Country Hub' : 'Register Your Village Hub'}
        </h1>
        <p className="text-muted-foreground">
          {hubType === 'country'
            ? 'Deliver across Zimbabwe and earn Pi per delivery.'
            : 'Serve your local community and earn Pi per delivery.'}
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-border/60 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hub Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
              <Building2 className="h-4 w-4 text-zw-green" /> Hub Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={hubType === 'country' ? 'e.g. Pi Express Zimbabwe' : 'e.g. Buhera Village 5 Hub'}
              className="h-11"
            />
            {errors.name && <p className="text-xs text-zw-red mt-1">{errors.name}</p>}
          </div>

          {/* Country Hub: Provinces + Transport */}
          {hubType === 'country' && (
            <>
              {/* Country-wide toggle */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Coverage Area</label>
                <button
                  type="button"
                  onClick={() => setIsCountryWide(!isCountryWide)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all mb-2',
                    isCountryWide
                      ? 'border-zw-green bg-zw-green/5'
                      : 'border-border/60 hover:border-zw-green/30'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                    isCountryWide ? 'border-zw-green bg-zw-green' : 'border-border'
                  )}>
                    {isCountryWide && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Deliver anywhere in Zimbabwe</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Country-wide coverage - all provinces</p>
                  </div>
                </button>

                {/* Province multi-select */}
                {!isCountryWide && (
                  <div className="animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">Select provinces you cover:</p>
                    <div className="flex flex-wrap gap-2">
                      {ZIM_PROVINCES.map((prov) => {
                        const selected = provincesCovered.includes(prov);
                        return (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => toggleProvince(prov)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                              selected
                                ? 'bg-zw-green text-white border-zw-green'
                                : 'border-border/60 hover:border-zw-green/30'
                            )}
                          >
                            {prov}
                          </button>
                        );
                      })}
                    </div>
                    {errors.provinces && <p className="text-xs text-zw-red mt-1">{errors.provinces}</p>}
                  </div>
                )}
              </div>

              {/* Transport type */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Transport Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(TRANSPORT_LABELS) as TransportType[]).map((t) => {
                    const Icon = transportIconMap[t];
                    const selected = transportType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTransportType(t)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                          selected ? 'border-zw-green bg-zw-green/5' : 'border-border/60 hover:border-zw-green/30'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', selected ? 'text-zw-green' : 'text-muted-foreground')} />
                        <span className="text-[10px] font-medium">{TRANSPORT_LABELS[t]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Local Hub: Province > District > Village */}
          {hubType === 'local' && (
            <>
              {/* Province */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-zw-green" /> Province
                </Label>
                <Select value={province} onValueChange={(v) => { setProvince(v); setDistrict(''); }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                  <SelectContent>
                    {ZIM_PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && <p className="text-xs text-zw-red mt-1">{errors.province}</p>}
              </div>

              {/* District */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">District</Label>
                <Select value={district} onValueChange={setDistrict} disabled={!province}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={province ? 'Select your district' : 'Select province first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(ZIM_DISTRICTS[province] || []).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-xs text-zw-red mt-1">{errors.district}</p>}
              </div>

              {/* Ward */}
              <div>
                <Label htmlFor="ward" className="text-sm font-semibold mb-1.5 block">Ward (optional)</Label>
                <Input
                  id="ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g. Ward 12"
                  className="h-11"
                />
              </div>

              {/* Village / Suburb */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="village" className="text-sm font-semibold mb-1.5 block">Village</Label>
                  <Input
                    id="village"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Buhera, Village 5"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="suburb" className="text-sm font-semibold mb-1.5 block">Suburb</Label>
                  <Input
                    id="suburb"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    placeholder="e.g. Mbare, Highfields"
                    className="h-11"
                  />
                </div>
              </div>
              {(errors.village) && <p className="text-xs text-zw-red -mt-3">{errors.village}</p>}

              {/* Coverage radius */}
              <div>
                <Label htmlFor="coverage" className="text-sm font-semibold mb-1.5 block">Coverage Radius (km)</Label>
                <Input
                  id="coverage"
                  type="number"
                  min="1"
                  max="100"
                  value={coverageRadiusKm}
                  onChange={(e) => setCoverageRadiusKm(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-1">How far from your location can you deliver?</p>
              </div>

              {/* Transport type */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Transport Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(TRANSPORT_LABELS) as TransportType[]).map((t) => {
                    const Icon = transportIconMap[t];
                    const selected = transportType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTransportType(t)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                          selected ? 'border-zw-green bg-zw-green/5' : 'border-border/60 hover:border-zw-green/30'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', selected ? 'text-zw-green' : 'text-muted-foreground')} />
                        <span className="text-[10px] font-medium">{TRANSPORT_LABELS[t]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Phone + WhatsApp */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
                <Phone className="h-4 w-4 text-zw-green" /> Phone
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
            <div>
              <Label htmlFor="whatsapp" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-zw-green" /> WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+263 77 123 4567"
                className="h-11"
              />
              {errors.whatsapp && <p className="text-xs text-zw-red mt-1">{errors.whatsapp}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-semibold mb-1.5 block">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers about your hub - storage capacity, operating hours, etc."
              rows={3}
            />
          </div>

          {/* Fee */}
          <div>
            <Label htmlFor="fee" className="text-sm font-semibold mb-1.5 block flex items-center gap-1">
              <Wallet className="h-4 w-4 text-zw-green" /> Delivery Fee (Pi per delivery)
            </Label>
            <div className="relative">
              <Input
                id="fee"
                type="number"
                step="0.01"
                min="0"
                value={feePi}
                onChange={(e) => setFeePi(e.target.value)}
                className="h-11 pr-12 text-lg font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zw-green">
                π
              </span>
            </div>
            {errors.feePi && <p className="text-xs text-zw-red mt-1">{errors.feePi}</p>}
            <p className="text-xs text-muted-foreground mt-1.5">
              You will earn {formatPi(parseFloat(feePi) || 0)} per delivery handled through your hub.
            </p>
          </div>

          {/* Auto-approve note */}
          <div className="p-3 rounded-xl bg-zw-green/5 border border-zw-green/20">
            <p className="text-xs text-zw-green-700 flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Your hub will be approved instantly and visible to buyers right away. No waiting required.
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-zw-green hover:bg-zw-green-600 text-white rounded-full text-base font-semibold"
          >
            <Package className="h-5 w-5 mr-1.5" /> Register {hubType === 'country' ? 'Country' : 'Village'} Hub
          </Button>
        </form>
      </Card>
    </div>
  );
}
