import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  Truck, 
  CreditCard, 
  Store, 
  RotateCcw, 
  Ruler, 
  MessageCircle 
} from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | ARUBEKEE COLLECTION',
  description: 'Answers to common questions about ordering, nationwide logistics, pay-on-arrival courier waybills, Aba showroom pickup, and sizing.',
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Ordering & Payment',
      icon: CreditCard,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all Nigerian debit cards (Mastercard, Visa, Verve), direct bank transfers, and USSD banking codes. All payments are securely processed by Paystack under Central Bank of Nigeria regulations. We do not store or see your card PIN or CVV.',
        },
        {
          q: 'Are all prices in Nigerian Naira?',
          a: 'Yes, every product price is displayed in Nigerian Naira (₦ NGN). We compute totals down to integer kobo to ensure exact calculations without rounding discrepancies.',
        },
        {
          q: 'Does adding an item to my bag reserve the stock?',
          a: 'No. To keep inventory fair for all shoppers, items are only reserved once checkout begins and payment is initiated. At that point, your pieces are locked in our Aba atelier for 15 minutes while you complete payment.',
        },
      ],
    },
    {
      title: 'Delivery, Logistics & Waybill',
      icon: Truck,
      questions: [
        {
          q: 'Do you charge delivery fees online?',
          a: 'No. ARUBEKEE COLLECTION does not take charge of, mark up, or collect delivery fees online. When checking out, your online payment covers 100% of your ordered garments only. All courier transit and waybill fees are determined by the independent logistics transporter (based on destination, parcel weight, and cargo type) and are paid directly by the customer to the courier upon delivery or waybill collection.',
        },
        {
          q: 'How long does delivery take across Nigeria?',
          a: 'We dispatch parcels from our Aba showroom (Monday – Saturday). Within Aba metropolis, delivery takes same-day or 24 hours. Other South-East destinations (Enugu, Owerri, Onitsha, Awka, Umuahia) take 1 to 2 business days. Lagos, Port Harcourt, and Abuja commercial corridors take 2 to 3 business days. Nationwide interstate deliveries to all other states take 3 to 5 business days.',
        },
        {
          q: 'Which logistics couriers do you use?',
          a: 'We partner with vetted, reputable logistics transporters including GIG Logistics, Peace Mass Transit, dedicated intra-city dispatch riders, and priority air cargo services. As soon as your parcel is dispatched, we communicate your official Waybill Reference Number and carrier details via WhatsApp and SMS.',
        },
        {
          q: 'How do I track my order once it is dispatched?',
          a: 'You can enter your Order Reference (e.g. ARUBEKEE-2611-XXXX) on our Track Order page at any time to monitor real-time fulfillment, view your courier waybill tracking number, and confirm delivery with 1 tap once your parcel arrives.',
        },
      ],
    },
    {
      title: 'Aba Boutique Showroom Pickup',
      icon: Store,
      questions: [
        {
          q: 'Can I pick up my order in person in Aba?',
          a: 'Yes! Aba showroom collection is completely free of charge (₦0). Simply select "Aba Boutique Pickup" during checkout. Our showroom is located in the Ehi Road Fashion District, Aba, Abia State, and is open Monday through Saturday from 9:00 AM to 6:00 PM.',
        },
        {
          q: 'How quickly is my order ready for pickup?',
          a: 'In-store collection orders are packaged and ready within 2 hours of payment confirmation. You will receive an SMS and WhatsApp notification as soon as your parcel is ready at the showroom pickup desk.',
        },
        {
          q: 'What do I need to bring for pickup?',
          a: 'Please present your Order Reference number (e.g. ARUBEKEE-2611-XXXX) from your confirmation SMS or WhatsApp when picking up your garments in-store.',
        },
      ],
    },
    {
      title: 'Sizing & Garment Fit',
      icon: Ruler,
      questions: [
        {
          q: 'What sizing system do you use for dresses and shoes?',
          a: 'Our clothing uses standard UK dress sizing (UK 6 to UK 20). Our shoes use EU sizing (EU 36 to EU 42). Please consult our detailed Size Guide with centimeter measurements for bust, waist, and hips before placing your order.',
        },
        {
          q: 'Are your items in stock and ready to ship, or custom tailored?',
          a: 'All our pieces are 100% ready-to-wear and physically in stock at our Aba boutique showroom. Every garment, pair of shoes, and bag is handpicked, quality-inspected, and dispatched within 24 hours.',
        },
        {
          q: 'How do I ensure the best fit before ordering?',
          a: 'Each piece features verified measurements and our Stylist’s Note on fit. If you are unsure between sizes, tap "Chat on WhatsApp" and our boutique team will happily advise you on the exact fit.',
        },
      ],
    },
    {
      title: 'Quality Assurance & Customer Care',
      icon: RotateCcw,
      questions: [
        {
          q: 'What happens if an item arrives defective or incorrect?',
          a: 'Every piece is thoroughly inspected by our quality control lead in Aba before dispatch. In the rare event you receive a garment with a manufacturing defect or an incorrect size/colour, notify our customer care team within 48 hours of parcel delivery confirmation. Items must remain unworn, unwashed, and have brand tags intact.',
        },
        {
          q: 'How do I reach support or report an order issue?',
          a: 'You can report an issue directly via our Track Order page or message our Aba customer care concierge on WhatsApp (+234 916 416 1091) with your Order Reference and clear photos of the piece.',
        },
      ],
    },
  ];

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

        {/* Header */}
        <div className="border-b border-sand-300 pb-8 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand-200/60 rounded-full text-[11px] font-medium tracking-widest uppercase text-stone-700 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-oxblood-700" />
            Customer Help Desk
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-stone-900 tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-2xl">
            Everything you need to know about purchasing from ARUBEKEE COLLECTION, dispatching orders from Aba, pay-on-arrival courier waybills, and sizing.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-10">
          {faqCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-sand-200">
                  <div className="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-oxblood-700 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-xl text-stone-900 font-bold">
                    {cat.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {cat.questions.map((faq, fIdx) => (
                    <div key={fIdx} className="space-y-1.5 text-sm">
                      <h3 className="font-semibold text-stone-900 text-sm flex items-start gap-2">
                        <span className="text-oxblood-700 font-bold">Q.</span>
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-stone-600 pl-6 leading-relaxed text-xs sm:text-sm">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct WhatsApp Concierge Banner */}
        <div className="mt-12 bg-sand-100 p-8 rounded-lg border border-sand-300 text-center">
          <h3 className="font-serif text-xl text-stone-900 mb-2">Still Have a Question?</h3>
          <p className="text-xs text-stone-600 mb-6 max-w-md mx-auto">
            Our Aba boutique team is available Monday to Saturday to assist you with styling advice, sizing recommendations, or logistics and waybill inquiries.
          </p>
          <a
            href="https://wa.me/2349164161091?text=Hello%20ARUBEKEE%20COLLECTION%2C%20I%20have%20an%20inquiry%20about%20your%20products%20and%20delivery."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white text-xs font-semibold tracking-wider uppercase rounded hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
