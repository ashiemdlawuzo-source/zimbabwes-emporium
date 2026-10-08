'use client';

import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GcvBadge({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'sm';
}) {
  return (
    <Badge
      className={cn(
        'bg-zw-green text-white font-semibold gap-1 border-0',
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        className
      )}
    >
      <ShieldCheck className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
      GCV Supported
    </Badge>
  );
}
