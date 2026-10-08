import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowLeft, Lock, Users, Banknote } from 'lucide-react';

export const metadata: Metadata = {
  title: "Privacy Policy - Zimbabwe's Emporium",
  description: 'How Zimbabwe\'s Emporium handles your data. We collect only Pi username and delivery address for orders.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 bg-zimbabwe-flag" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-zw-green transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-zw-green/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-zw-green" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">Last updated: October 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-zw-green" /> What We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect only the minimum information needed to process your orders:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zw-green mt-2 shrink-0" />
                Your <strong className="text-foreground">Pi username</strong> — to associate orders with your Pi account
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zw-green mt-2 shrink-0" />
                Your <strong className="text-foreground">delivery address</strong> — to deliver orders to you
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zw-green mt-2 shrink-0" />
                <strong className="text-foreground">Order details</strong> — items, quantities, and payment IDs
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-zw-green" /> How We Use Your Data
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is used solely for processing orders and delivering products to you.
              We do <strong className="text-foreground">not sell, rent, or share</strong> your personal data
              with any third party. Your Pi username and delivery address are used only to
              fulfill your orders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-zw-green" /> Pi Payments
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All payments are processed through the Pi Network SDK. We never see, store, or
              handle your Pi wallet credentials or private keys. Payment approval and
              completion happen directly between you and the Pi blockchain via the Pi SDK.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can request deletion of your order data at any time by contacting us.
              Since we only store the minimum needed for order fulfillment, removing your
              data will not affect completed transactions on the Pi blockchain.
            </p>
          </section>

          <section className="rounded-xl bg-muted/50 p-5 border border-border/40">
            <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-zw-green" /> Contact Us
            </h2>
            <p className="text-sm text-muted-foreground">
              Questions about your privacy? Email us at{' '}
              <a
                href="mailto:Ashiemdlawuzo@gmail.com"
                className="text-zw-green font-medium hover:underline"
              >
                Ashiemdlawuzo@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-zw-green transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
