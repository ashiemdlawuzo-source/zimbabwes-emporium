import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Mail, ArrowLeft, Scale, MapPin, Truck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Terms of Service - Zimbabwe's Emporium",
  description: 'Terms of service for Zimbabwe\'s Emporium Pi marketplace. All transactions via Pi blockchain.',
};

export default function TermsPage() {
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
            <FileText className="h-6 w-6 text-zw-green" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
            Terms of Service
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">Last updated: October 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-zw-green" /> Marketplace Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Zimbabwe&apos;s Emporium is a marketplace where buyers and sellers trade using
              <strong className="text-foreground"> Pi only</strong>. By using this platform,
              you agree to conduct all transactions in Pi through the Pi Network SDK.
              No fiat currency (USD, ZWL, or other) is accepted or processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">Transactions</h2>
            <p className="text-muted-foreground leading-relaxed">
              All transactions are <strong className="text-foreground">final</strong> once
              confirmed on the Pi blockchain. Payments are processed directly through the
              Pi SDK and cannot be reversed, refunded, or disputed through Zimbabwe&apos;s
              Emporium. If you believe a transaction was made in error, contact the other
              party directly or reach out to us for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">Seller Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Sellers</strong> are solely responsible for
              the products they list, including accuracy of descriptions, images, pricing,
              and delivery. Sellers must fulfill orders promptly and ensure products meet
              the described quality. Zimbabwe&apos;s Emporium facilitates the marketplace
              but does not hold inventory or guarantee product quality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-zw-green" /> Hub Delivery
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Hub-based escrow delivery is available through the following hubs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Harare', 'Bulawayo', 'Mutare'].map((city) => (
                <div
                  key={city}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 border border-border/40"
                >
                  <MapPin className="h-4 w-4 text-zw-green" />
                  <span className="text-sm font-medium">{city}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Items delivered through hub escrow are held at the hub until the buyer
              confirms receipt. Direct delivery is also available for sellers who ship
              straight to the buyer&apos;s address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-zw-green" /> Disputes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For any disputes regarding orders, delivery, or product quality, contact us
              and we will help facilitate communication between buyer and seller.
              Since all Pi transactions are final on the blockchain, resolution depends on
              the goodwill of the parties involved.
            </p>
          </section>

          <section className="rounded-xl bg-muted/50 p-5 border border-border/40">
            <h2 className="text-lg font-heading font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-zw-green" /> Contact
            </h2>
            <p className="text-sm text-muted-foreground">
              Questions or disputes? Email us at{' '}
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
