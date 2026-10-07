'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { formatPi } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  MessageCircle,
  Building2,
  Plus,
  ArrowRight,
  Globe,
  Home,
  Truck,
  Bus,
  Bike,
  Footprints,
} from 'lucide-react';
import { HUBS, RegisteredHub, HubType, TransportType, TRANSPORT_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const transportIconMap: Record<TransportType, typeof Truck> = {
  truck: Truck,
  bus: Bus,
  bicycle: Bike,
  foot: Footprints,
};

export default function HubsPage() {
  const { registeredHubs } = useApp();
  const [filter, setFilter] = useState<'all' | 'country' | 'local'>('all');

  const allHubs = useMemo(() => {
    const staticHubs = HUBS.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.name,
      address: '',
      phone: '',
      whatsapp: '',
      description: h.description,
      feePi: 0,
      status: 'approved' as const,
      createdAt: 0,
      hubType: 'country' as HubType,
      isCountryWide: true,
      isStatic: true,
      province: undefined as string | undefined,
      district: undefined as string | undefined,
      ward: undefined as string | undefined,
      village: undefined as string | undefined,
      suburb: undefined as string | undefined,
      coverageRadiusKm: undefined as number | undefined,
      transportType: undefined as TransportType | undefined,
      provincesCovered: undefined as string[] | undefined,
    }));
    const dynamic = registeredHubs.map((h) => ({
      ...h,
      isStatic: false,
      hubType: h.hubType ?? 'country',
    }));
    return [...staticHubs, ...dynamic];
  }, [registeredHubs]);

  const countryHubs = allHubs.filter((h) => h.hubType === 'country');
  const localHubs = allHubs.filter((h) => h.hubType === 'local');

  const provincesCovered = useMemo(() => {
    const provs = new Set<string>();
    countryHubs.forEach((h) => {
      if (h.isCountryWide) {
        // covers everything
      }
      h.provincesCovered?.forEach((p) => provs.add(p));
    });
    localHubs.forEach((h) => {
      if (h.province) provs.add(h.province);
    });
    return provs.size;
  }, [countryHubs, localHubs]);

  const filtered = filter === 'all'
    ? allHubs
    : filter === 'country'
      ? countryHubs
      : localHubs;

  const approvedFiltered = filtered.filter((h) => h.status === 'approved');
  const pendingFiltered = filtered.filter((h) => h.status === 'pending');

  const HubTypeBadge = ({ type }: { type: HubType }) => (
    <Badge
      variant="outline"
      className={cn(
        'text-xs',
        type === 'country'
          ? 'bg-zw-green/10 text-zw-green border-zw-green/20'
          : 'bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30'
      )}
    >
      {type === 'country' ? (
        <><Globe className="h-3 w-3 mr-1" /> Country</>
      ) : (
        <><Home className="h-3 w-3 mr-1" /> Village</>
      )}
    </Badge>
  );

  const HubCard = ({ hub }: { hub: typeof allHubs[number] }) => {
    const TransportIcon = hub.transportType ? transportIconMap[hub.transportType] : null;
    const locationText = hub.hubType === 'local'
      ? [hub.village || hub.suburb, hub.district, hub.province].filter(Boolean).join(', ')
      : hub.isCountryWide
        ? 'Zimbabwe-wide'
        : hub.provincesCovered?.join(', ') || hub.city;

    return (
      <Card key={hub.id} className={cn(
        'p-5 border-border/60 hover:border-zw-green/30 hover:shadow-md transition-all',
        hub.status === 'pending' && 'border-zw-yellow/30 bg-zw-yellow-50/30'
      )}>
        <div className="flex items-start justify-between mb-2">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            hub.hubType === 'country' ? 'bg-zw-green-50' : 'bg-zw-yellow-50'
          )}>
            {hub.hubType === 'country' ? (
              <Globe className="h-5 w-5 text-zw-green" />
            ) : (
              <Home className="h-5 w-5 text-zw-yellow-600" />
            )}
          </div>
          {hub.status === 'pending' && (
            <Badge variant="outline" className="text-xs bg-zw-yellow/10 text-zw-yellow-700 border-zw-yellow/30">
              Pending
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-base mb-1">{hub.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <HubTypeBadge type={hub.hubType} />
          {TransportIcon && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <TransportIcon className="h-3 w-3" /> {TRANSPORT_LABELS[hub.transportType!]}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {locationText}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{hub.description}</p>

        {!hub.isStatic && (
          <>
            {hub.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Phone className="h-3 w-3" /> {hub.phone}
              </p>
            )}
            {hub.whatsapp && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MessageCircle className="h-3 w-3" /> {hub.whatsapp}
              </p>
            )}
            {hub.feePi > 0 && (
              <div className="mt-2 pt-2 border-t border-border/40">
                <span className="text-sm font-bold text-zw-green">{formatPi(hub.feePi)}</span>
                <span className="text-xs text-muted-foreground ml-1">per delivery</span>
              </div>
            )}
            {hub.hubType === 'local' && hub.coverageRadiusKm && (
              <p className="text-xs text-muted-foreground mt-1">
                Coverage: {hub.coverageRadiusKm}km radius
              </p>
            )}
          </>
        )}

        <Link href={`/search?hub=${hub.id}`}>
          <Button variant="ghost" size="sm" className="mt-3 text-zw-green hover:bg-zw-green-50 rounded-full p-0 h-8">
            Browse products <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">Delivery Hubs</h1>
          <p className="text-sm text-muted-foreground">
            Escrow delivery points across Zimbabwe - country hubs and village hubs.
          </p>
        </div>
        <Link href="/hub/register">
          <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full h-11 px-5">
            <Plus className="h-4 w-4 mr-1" /> Become a Hub
          </Button>
        </Link>
      </div>

      {/* Hub counts banner */}
      <Card className="p-4 mb-6 border-zw-green/20 bg-zw-green/5 animate-fade-up">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold">
            <Globe className="h-4 w-4 text-zw-green" />
            {countryHubs.length} Country Hub{countryHubs.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <Home className="h-4 w-4 text-zw-yellow-600" />
            {localHubs.length} Village Hub{localHubs.length !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">
            covering {provincesCovered} province{provincesCovered !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
            filter === 'all' ? 'bg-zw-green text-white border-zw-green' : 'border-border/60 hover:border-zw-green/30'
          )}
        >
          All Hubs ({allHubs.length})
        </button>
        <button
          onClick={() => setFilter('country')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1',
            filter === 'country' ? 'bg-zw-green text-white border-zw-green' : 'border-border/60 hover:border-zw-green/30'
          )}
        >
          <Globe className="h-3.5 w-3.5" /> Country ({countryHubs.length})
        </button>
        <button
          onClick={() => setFilter('local')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1',
            filter === 'local' ? 'bg-zw-green text-white border-zw-green' : 'border-border/60 hover:border-zw-green/30'
          )}
        >
          <Home className="h-3.5 w-3.5" /> Village ({localHubs.length})
        </button>
      </div>

      {/* Approved hubs */}
      {approvedFiltered.length > 0 && (
        <div className="mb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedFiltered.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>
        </div>
      )}

      {/* Pending hubs */}
      {pendingFiltered.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2 text-zw-yellow-600">
            Pending Hubs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingFiltered.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === 'local'
              ? 'No village hubs registered yet.'
              : filter === 'country'
                ? 'No country hubs registered yet.'
                : 'No hubs found.'}
          </p>
          <Link href="/hub/register" className="mt-4 inline-block">
            <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full">
              <Plus className="h-4 w-4 mr-1" /> Register a Hub
            </Button>
          </Link>
        </Card>
      )}

      {/* CTA */}
      <Card className="p-5 border-2 border-dashed border-zw-green/30 hover:border-zw-green/60 hover:bg-zw-green/5/30 transition-all mt-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zw-green/10 flex items-center justify-center shrink-0">
            <Plus className="h-6 w-6 text-zw-green" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-zw-green">No hub in your village?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Be the first! Register your location as a delivery hub and earn Pi per delivery.
            </p>
          </div>
          <Link href="/hub/register">
            <Button className="bg-zw-green hover:bg-zw-green-600 text-white rounded-full shrink-0">
              Register Now <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
