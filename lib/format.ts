import { GCV_USD_PER_PI } from './types';

export function formatPi(price: number): string {
  let formatted: string;
  if (Number.isInteger(price)) {
    formatted = price.toString();
  } else if (price >= 1) {
    formatted = price.toFixed(2).replace(/\.?0+$/, '');
  } else if (price >= 0.01) {
    formatted = price.toFixed(4).replace(/\.?0+$/, '');
  } else {
    formatted = price.toFixed(7).replace(/\.?0+$/, '');
  }
  return `${formatted} π`;
}

export function formatGcv(pricePi: number): string {
  const usd = pricePi * GCV_USD_PER_PI;
  return `${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatUsdApprox(pricePi: number): string {
  const usd = pricePi * GCV_USD_PER_PI;
  return `${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
