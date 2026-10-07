'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface QuoteCardProps {
  text: string;
  author: string;
}

export function QuoteCard({ text, author }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div
      className="relative bg-white rounded-xl shadow-lg p-6 mx-auto max-w-2xl"
      style={{
        borderTop: '2px solid #FFD100',
        borderLeft: '4px solid #009739',
      }}
    >
      <p className="italic text-lg sm:text-xl text-gray-800 text-center leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
      <p className="mt-4 text-sm text-gray-500 text-center">— {author}</p>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white rounded-full px-4 py-2 transition-colors"
          style={{ backgroundColor: copied ? '#007a30' : '#009739' }}
        >
          {copied ? (
            <>
              Copied! <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Copy <Copy className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
