import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database, Bell } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | ARUBEKEE COLLECTION',
  description: 'How ARUBEKEE COLLECTION collects, protects, and handles customer data in compliance with the Nigeria Data Protection Act (NDPA 2023).',
};

export default function PrivacyPage() {
  return (
    <div className="bg-sand-50 min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-xs tracking-widest uppercase font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Storefront
          </Link>
        </div>

        {/* Header Banner */}
        <div className="border-b border-sand-300 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand-200/60 rounded-full text-[11px] font-medium tracking-widest uppercase text-stone-700 mb-4">
            <Lock className="w-3.5 h-3.5 text-oxblood-700" />
            Data Protection & Consumer Privacy
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            At <strong className="text-stone-900">ARUBEKEE COLLECTION</strong>, we respect your privacy and take the security of your personal data seriously. This Privacy Notice describes our practices regarding the collection, storage, and processing of your personal information in accordance with the 
            <strong> Nigeria Data Protection Act (NDPA) 2023</strong> and the Nigeria Data Protection Regulation (NDPR).
          </p>
          <p className="text-xs text-stone-500 mt-3">
            Effective Date: November 2026 • Data Controller: ARUBEKEE COLLECTION, Aba, Abia State, Nigeria
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-10 text-stone-800 text-sm md:text-base leading-relaxed">
          
          {/* 1. What Information We Collect */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">01.</span>
              Information We Collect
            </h2>
            <p className="text-stone-600 mb-4">
              We collect only the essential information needed to fulfill your fashion orders and provide a personalized luxury shopping experience:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-sand-50 rounded border border-sand-200">
                <h3 className="font-semibold text-stone-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-oxblood-700" /> Contact & Fulfilment
                </h3>
                <p className="text-xs text-stone-600 leading-normal">
                  Full name, delivery phone number (normalized to +234), email address for e-receipts and tracking, delivery address, city, state, and nearest landmarks for courier waybills.
                </p>
              </div>
              <div className="p-4 bg-sand-50 rounded border border-sand-200">
                <h3 className="font-semibold text-stone-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-oxblood-700" /> Order History & Preferences
                </h3>
                <p className="text-xs text-stone-600 leading-normal">
                  Items ordered, sizes selected, past transactions, wishlist bookmarks, and WhatsApp communication records related to sizing or custom inquiries.
                </p>
              </div>
            </div>
            <p className="text-stone-600 text-xs mt-4">
              * Note: We do not store raw card numbers, expiry dates, or CVVs. All card processing is encrypted and executed by our CBN-licensed payment partner, Paystack.
            </p>
          </section>

          {/* 2. How We Use Information */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">02.</span>
              Lawful Basis & Use of Personal Data
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>We process your data based on contractual necessity and your express consent:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-700 text-sm">
                <li><strong>Order Fulfilment:</strong> Processing transactions, preparing garment packaging, and handing over parcels to waybill couriers.</li>
                <li><strong>Logistics Communication:</strong> Sending SMS/WhatsApp notifications with waybill tracking references and delivery arrival alerts.</li>
                <li><strong>Customer Support:</strong> Resolving sizing inquiries, exchange requests, or payment verification disputes.</li>
                <li><strong>Fraud Prevention:</strong> Detecting fraudulent transactions and safeguarding our storefront against malicious abuse.</li>
              </ul>
            </div>
          </section>

          {/* 3. Data Sharing & Third Parties */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">03.</span>
              Third-Party Disclosures
            </h2>
            <p className="text-stone-600 mb-3">
              We never sell or rent your personal details to advertising networks or third-party data brokers. We share your information strictly with vetted service providers necessary to operate our business:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-stone-700 text-sm">
              <li><strong>Payment Gateway:</strong> Paystack Payments Limited (processes card, USSD, and bank transfer settlements).</li>
              <li><strong>Logistics Couriers:</strong> Reputable delivery networks (e.g., GIG Logistics, DHL, park waybill operators) strictly for shipping labels.</li>
              <li><strong>Cloud Infrastructure:</strong> High-security database hosts with row-level security and encrypted backups.</li>
            </ul>
          </section>

          {/* 4. Data Retention & Security */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">04.</span>
              Data Security & Retention
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>
                We employ industry-standard cryptographic protocols (TLS/HTTPS encryption) across our website and administrative portal. All customer profiles and order histories are protected behind strict authentication and role-based permissions.
              </p>
              <p>
                We retain your purchase history for as long as necessary to comply with Nigerian statutory tax, accounting, and anti-money laundering obligations, after which obsolete data is securely purged or anonymized.
              </p>
            </div>
          </section>

          {/* 5. Your Rights */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">05.</span>
              Your Rights Under the Nigeria Data Protection Act
            </h2>
            <p className="text-stone-600 mb-3">
              Under Nigerian privacy law, you are entitled to exercise the following rights regarding your personal records:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
              <div className="p-3 bg-sand-100/70 rounded">
                <strong>Right to Access:</strong> Request a copy of the personal information we hold about you.
              </div>
              <div className="p-3 bg-sand-100/70 rounded">
                <strong>Right to Rectification:</strong> Request correction of inaccurate contact or shipping information.
              </div>
              <div className="p-3 bg-sand-100/70 rounded">
                <strong>Right to Erasure:</strong> Request deletion of your customer account where permitted by tax laws.
              </div>
              <div className="p-3 bg-sand-100/70 rounded">
                <strong>Right to Withdraw Consent:</strong> Opt out of promotional newsletters or SMS announcements at any time.
              </div>
            </div>
          </section>

        </div>

        {/* Contact Strip */}
        <div className="mt-12 bg-sand-100 p-6 rounded-lg border border-sand-300 text-center">
          <p className="text-sm text-stone-700 font-medium mb-1">Data Protection Officer Inquiries</p>
          <p className="text-xs text-stone-500 mb-4">
            To exercise your data privacy rights or ask questions regarding our privacy compliance, please reach out to our team.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2.5 bg-stone-900 text-white text-xs font-medium tracking-wider uppercase rounded hover:bg-oxblood-700 transition-colors"
          >
            Contact Privacy Officer
          </Link>
        </div>

      </div>
    </div>
  );
}

