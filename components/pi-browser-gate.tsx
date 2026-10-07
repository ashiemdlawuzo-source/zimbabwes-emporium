'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';

const SITE_URL = 'https://zimbabwes-emporium-m-14kl.bolt.host';

function detectPiBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /PiBrowser/i.test(navigator.userAgent) ||
    !!(window as unknown as Record<string, unknown>).Pi ||
    !!(window as unknown as Record<string, unknown>).__PI_BROWSER__
  );
}

export function PiBrowserGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(true);
  const [bypassed, setBypassed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsPiBrowser(detectPiBrowser());
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (isPiBrowser || bypassed) {
    return <>{children}</>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = SITE_URL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zw-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Pi logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zw-green to-zw-green-600 flex items-center justify-center shadow-2xl shadow-zw-green/20">
            <span className="text-4xl font-extrabold font-heading text-white">Pi</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-center mb-3 text-white">
          Please Open in Pi Browser
        </h1>

        {/* Message */}
        <p className="text-white/70 text-center mb-2 leading-relaxed">
          Pi payments only work inside the Pi Browser app.
        </p>
        <p className="text-white/50 text-center text-sm mb-8">
          You are currently in Chrome/WhatsApp — payments will fail here.
        </p>

        {/* URL copy box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <code className="text-sm text-zw-green font-mono truncate flex-1">
              {SITE_URL}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zw-green hover:bg-zw-green-600 text-white text-sm font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {[
            { num: '1', text: 'Copy the link above' },
            { num: '2', text: 'Open the Pi Browser app on your phone' },
            { num: '3', text: 'Paste the link in Pi Browser address bar' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zw-green/20 border border-zw-green/40 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-zw-green">{step.num}</span>
              </div>
              <p className="text-white/80 text-sm">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Download Pi Browser hint */}
        <a
          href="https://minepi.com/pi-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors mb-6"
        >
          <ExternalLink className="h-4 w-4" />
          Download Pi Browser
          <ArrowRight className="h-4 w-4" />
        </a>

        {/* Bypass link */}
        <div className="text-center">
          <button
            onClick={() => setBypassed(true)}
            className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Continue in Chrome for Testnet testing
          </button>
        </div>
      </div>
    </div>
  );
}
