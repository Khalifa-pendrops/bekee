'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, MessageSquare, Clock, Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-14 text-left">
      <div className="border-b border-stone-line pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Aba Boutique & Atelier
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
          Get in Touch With Us
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted max-w-xl">
          We welcome you to visit our showroom in Aba, chat directly with our founder on WhatsApp, or send an enquiry regarding bespoke tailoring and orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Info & Boutique Hours */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-ivory-warm border border-stone-line p-6 space-y-6">
            <h3 className="font-serif text-xl text-obsidian font-semibold">
              Boutique Details
            </h3>

            <div className="space-y-4 text-xs text-obsidian-soft">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-obsidian font-semibold">Showroom & Collection Point:</strong>
                  <span>Ehi Road Fashion District, Aba, Abia State, Nigeria</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-obsidian font-semibold">Opening Hours (WAT):</strong>
                  <span>Monday – Friday: 9:00 AM – 6:00 PM</span><br />
                  <span>Saturday: 10:00 AM – 5:00 PM</span><br />
                  <span>Sunday: Closed for Church & Rest</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-obsidian font-semibold">Customer Care Phone:</strong>
                  <span>+234 803 000 1234</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-obsidian font-semibold">Email:</strong>
                  <span>care@arubekee.com</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-line">
              <a
                href="https://wa.me/2348030001234?text=Hello%20Arubekee%20Collection,%20I%20would%20like%20to%20enquire%20about%20visiting%20your%20store%20in%20Aba"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button variant="whatsapp" size="md" className="w-full text-xs uppercase tracking-wider gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-ivory border border-stone-line p-6 sm:p-8 shadow-card">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-status-success mx-auto" />
              <h3 className="font-serif text-2xl text-obsidian">Message Received!</h3>
              <p className="text-xs text-obsidian-muted max-w-sm mx-auto">
                Thank you for reaching out to ARUBEKEE COLLECTION. Our customer care team will reply via WhatsApp or email within a few hours.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl text-obsidian font-semibold mb-2">
                Send an Enquiry
              </h3>

              <Input
                label="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chioma Okonkwo"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chioma@example.com"
                  required
                />
                <Input
                  label="Phone / WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0803 123 4567"
                  required
                />
              </div>

              <Textarea
                label="Message or Special Fitting Request"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about sizing, boutique visit, bulk orders, or custom event fittings..."
                rows={5}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full uppercase tracking-wider text-xs"
              >
                Submit Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

