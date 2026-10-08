'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PiSDK } from './pi-types';

const PI_SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';
const PI_APP_ID = 'zimbabwe-emporium';

let sdkLoadPromise: Promise<PiSDK | null> | null = null;

function loadSdkScript(): Promise<PiSDK | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Pi) return Promise.resolve(window.Pi);

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<PiSDK | null>((resolve) => {
    const existing = document.querySelector(`script[src="${PI_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Pi ?? null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }

    const script = document.createElement('script');
    script.src = PI_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        try {
          window.Pi.init({ version: '2.0', sandbox: true });
          resolve(window.Pi);
        } catch {
          resolve(window.Pi ?? null);
        }
      } else {
        resolve(null);
      }
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

export function usePiSdk() {
  const [sdk, setSdk] = useState<PiSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSdkScript().then((pi) => {
      if (cancelled) return;
      if (pi) {
        setSdk(pi);
      } else {
        setError('Pi SDK failed to load. Make sure you are using the Pi Browser.');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const onIncompletePaymentFound = useCallback((payment: { identifier: string }) => {
    fetch('/api/pi/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.identifier, txid: '' }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error('Incomplete payment completion failed:', data);
        }
      })
      .catch((err) => console.error('Failed to handle incomplete payment:', err));
  }, []);

  const authenticate = useCallback(async () => {
    if (!sdk) return null;
    try {
      const result = await sdk.authenticate(['username', 'payments'], onIncompletePaymentFound);
      return result;
    } catch (err) {
      console.error('Pi authentication failed:', err);
      return null;
    }
  }, [sdk, onIncompletePaymentFound]);

  const createPayment = useCallback(
    async (
      amount: number,
      memo: string,
      metadata: Record<string, unknown>,
      callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error) => void;
      }
    ) => {
      if (!sdk) {
        callbacks.onError(new Error('Pi SDK not loaded'));
        return;
      }
      try {
        await sdk.authenticate(['username', 'payments'], onIncompletePaymentFound);
        const amount7dp = Number(amount.toFixed(7));
        sdk.createPayment({ amount: amount7dp, memo, metadata }, callbacks);
      } catch (err) {
        callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [sdk, onIncompletePaymentFound]
  );

  return { sdk, loading, error, createPayment, authenticate };
}

export { PI_APP_ID };
