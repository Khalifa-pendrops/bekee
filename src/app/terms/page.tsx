import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | ARUBEKEE COLLECTION',
  description: 'Terms of sale, exchange guidelines, delivery policies, and customer rights under Nigerian commercial regulations.',
};

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5 text-oxblood-700" />
            Legal & Customer Protections
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 tracking-tight mb-4">
            Terms & Conditions of Sale
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            Please read these terms carefully before placing an order with <strong className="text-stone-900">ARUBEKEE COLLECTION</strong>.
            Operating out of Aba, Abia State, Nigeria, we conduct commerce in accordance with the 
            Federal Competition and Consumer Protection Act (FCCPA) 2018 and Nigerian commercial law.
          </p>
          <p className="text-xs text-stone-500 mt-3">
            Last updated: November 2026 • Governed by the Laws of the Federal Republic of Nigeria
          </p>
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-10 text-stone-800 text-sm md:text-base leading-relaxed">
          
          {/* 1. Orders & Pricing */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">01.</span>
              Currency, Pricing & Order Acceptance
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>
                All prices displayed on this storefront are in Nigerian Naira (₦ / NGN) and are stored in integer kobo to ensure exact calculations.
              </p>
              <p>
                Placing an item in your shopping bag does not reserve stock or freeze the price. Stock is only reserved for 15 minutes once checkout and payment initiation are confirmed.
              </p>
              <p>
                We reserve the right to decline or cancel any order in instances of genuine typographical errors in pricing, inventory discrepancies, or unverified card transactions. In the event of a cancellation after payment verification, a prompt full refund will be initiated to your original payment source.
              </p>
            </div>
          </section>

          {/* 2. Payment Terms */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">02.</span>
              Payment Processing & Security
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>
                Online debit card payments, bank transfers, and USSD transactions are securely processed through <strong className="text-stone-800">Paystack</strong> (licensed by the Central Bank of Nigeria).
              </p>
              <p>
                ARUBEKEE COLLECTION does not store, process, or have access to your full debit card PAN, CVV, or banking PINs.
              </p>
              <p>
                Orders are only dispatched once our automated payment gateway returns an authoritative, verified settlement status. We do not accept handwritten physical bank slips or unverified SMS alerts as proof of payment for online orders.
              </p>
            </div>
          </section>

          {/* 3. Delivery & Transit Risk */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">03.</span>
              Fulfilment, Delivery Zones & Boutique Pickup
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>
                <strong>Delivery Fees:</strong> Delivery charges are computed transparently during checkout based on your state and designated delivery zone. For remote or interstate destinations outside standardized routes, customers may submit a <Link href="/checkout" className="text-oxblood-700 underline font-medium">Delivery Quote Request</Link> before committing payment.
              </p>
              <p>
                <strong>Aba Boutique Pickup:</strong> Customers selecting showroom pickup in Aba must present their official Order Confirmation SMS or Email alongside valid identification before merchandise will be handed over.
              </p>
              <p>
                <strong>Waybill & Courier Logistics:</strong> For interstate shipments (Lagos, Abuja, Port Harcourt, Enugu, Owerri, etc.), packages are consigned with reputable logistics partners (GIG Logistics, DHL, park waybill services). A trackable waybill number will be issued. Transit times are estimates and may vary slightly due to interstate transit checks or severe weather.
              </p>
            </div>
          </section>

          {/* 4. Exchanges & Returns */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">04.</span>
              Return, Exchange & Defect Guidelines
            </h2>
            <div className="space-y-3 text-stone-600">
              <p>
                We inspect every garment, pair of shoes, and handbag prior to dispatch. If you receive an item with a manufacturing defect or an incorrect size/colour, you must notify us within <strong>48 hours of receipt</strong>.
              </p>
              <p>
                To qualify for an exchange or store credit:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
                <li>Items must remain unworn, unwashed, and scent-free (no perfume or makeup marks).</li>
                <li>Original brand hang-tags and protective packaging must be intact.</li>
                <li>Intimate wear, pierced jewellery, and items bought on final sale clearance are non-returnable for hygiene reasons.</li>
              </ul>
              <p className="pt-2">
                For detailed instructions on packaging and dispatching an authorized return, consult our dedicated <Link href="/returns" className="text-oxblood-700 underline font-medium">Returns Policy</Link>.
              </p>
            </div>
          </section>

          {/* 5. Intellectual Property */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">05.</span>
              Brand Ownership & Imagery
            </h2>
            <p className="text-stone-600">
              All editorial lookbook photography, styling concepts, brand logos, product copy, and design collateral displayed across this storefront are the exclusive intellectual property of ARUBEKEE COLLECTION. Unauthorized commercial reproduction, automated scraping, or re-use in counterfeit listings is strictly prohibited under Nigerian copyright law.
            </p>
          </section>

          {/* 6. Dispute Resolution */}
          <section className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-4 flex items-center gap-2">
              <span className="text-oxblood-700 font-sans text-sm font-semibold">06.</span>
              Governing Law & Dispute Resolution
            </h2>
            <p className="text-stone-600 mb-3">
              These terms are governed by and construed in accordance with the laws of Abia State and the Federal Republic of Nigeria. In the event of any disagreement or customer complaint:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-stone-700">
              <li>Both parties agree first to attempt amicable resolution via direct communication with our Customer Care desk within 14 business days.</li>
              <li>Failing amicable resolution, disputes shall be submitted to the jurisdiction of the competent courts of Abia State, Nigeria.</li>
            </ol>
          </section>

        </div>

        {/* Contact Strip */}
        <div className="mt-12 bg-sand-100 p-6 rounded-lg border border-sand-300 text-center">
          <p className="text-sm text-stone-700 font-medium mb-2">Have a question regarding our Terms?</p>
          <p className="text-xs text-stone-500 mb-4">Our Aba boutique concierge is available Monday to Saturday to assist you.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-stone-900 text-white text-xs font-medium tracking-wider uppercase rounded hover:bg-oxblood-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="px-5 py-2.5 bg-white text-stone-800 text-xs font-medium tracking-wider uppercase border border-sand-300 rounded hover:bg-sand-50 transition-colors"
            >
              Read FAQs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

