'use client';

import React, { useState } from "react";
import { db } from "@/lib/db";
import { Order } from "@/types";
import { formatKoboToNaira } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Package, 
  Search, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setOrder(null);
    setHasSearched(true);

    if (!orderNumber.trim()) {
      setErrorMessage("Please enter your Order Reference (e.g. ARU-...)");
      return;
    }

    setIsLoading(true);
    try {
      const foundOrder = await db.getOrderByNumber(orderNumber.trim().toUpperCase());

      if (!foundOrder) {
        setErrorMessage("No order found with that reference. Please check your SMS or email confirmation.");
        setIsLoading(false);
        return;
      }

      // Security check: verify phone number matches if phone was provided
      if (phoneNumber.trim()) {
        const cleanInputPhone = phoneNumber.replace(/[^0-9]/g, '');
        const cleanOrderPhone = foundOrder.customerPhone.replace(/[^0-9]/g, '');

        if (!cleanOrderPhone.includes(cleanInputPhone) && !cleanInputPhone.includes(cleanOrderPhone)) {
          setErrorMessage("The phone number does not match this order reference for security verification.");
          setIsLoading(false);
          return;
        }
      }

      setOrder(foundOrder);
    } catch (err) {
      setErrorMessage("Unable to retrieve order details right now. Please try again or chat with us on WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Live Dispatch Tracking
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian font-normal">
          Track Your Fashion Parcel
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed">
          Enter the Order Number sent to your email or SMS, along with your registered phone number, to check live dispatch and fulfillment status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-ivory border border-stone-line p-6 sm:p-8 shadow-card max-w-xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <Input
            label="Order Reference"
            placeholder="e.g. ARU-2611-9481 or ARU-OFF-..."
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />

          <Input
            label="Registered Phone Number"
            placeholder="e.g. 0803 123 4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            hint="For security verification"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full uppercase tracking-wider text-xs"
          >
            Track Order
          </Button>

          {errorMessage && (
            <div className="p-3 bg-status-dangerBg border border-status-danger/20 text-status-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Order Results Display */}
      {order && (
        <div className="bg-ivory border border-stone-line shadow-card p-6 sm:p-8 space-y-8 animate-fade-in text-left">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-line pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-oxblood">
                Order Status
              </span>
              <h2 className="font-serif text-2xl text-obsidian mt-0.5">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-obsidian-muted mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'inventory_conflict_quarantined' ? 'warning' : 'default'}
              >
                Payment: {order.paymentStatus.replace(/_/g, ' ')}
              </Badge>

              <Badge
                variant={order.fulfillmentStatus === 'delivered' ? 'success' : order.fulfillmentStatus === 'dispatched' ? 'info' : 'default'}
              >
                Fulfillment: {order.fulfillmentStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Logistics & Tracking Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ivory-warm p-5 border border-stone-line">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-soft block">
                Fulfillment Route
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-obsidian">
                {order.deliveryType === 'aba_pickup' ? (
                  <>
                    <MapPin className="w-4 h-4 text-oxblood" />
                    <span>Aba Boutique Showroom Pickup</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-oxblood" />
                    <span>Courier Interstate Delivery</span>
                  </>
                )}
              </div>

              {order.shippingAddress && (
                <p className="text-xs text-obsidian-muted">
                  {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  {order.shippingAddress.landmark && ` (Near ${order.shippingAddress.landmark})`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-soft block">
                Dispatch Courier & Tracking
              </span>
              {order.carrierName ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-obsidian">
                    Courier: <strong>{order.carrierName}</strong>
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs text-obsidian-muted">
                      Waybill / Waybill No: <code className="bg-ivory px-1.5 py-0.5 border border-stone-line font-mono">{order.trackingNumber}</code>
                    </p>
                  )}
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-oxblood underline hover:text-oxblood-hover mt-1 font-semibold"
                    >
                      <span>Track with Courier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-obsidian-muted">
                  Your parcel is being packaged in our Aba studio. Dispatch details will update once handed over to the courier.
                </p>
              )}
            </div>
          </div>

          {/* Order Items Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
              Items in this Parcel
            </h3>
            <div className="divide-y divide-stone-line border-y border-stone-line">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-obsidian">{item.productName}</p>
                    <p className="text-obsidian-muted text-[11px]">
                      {item.colorName} • {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-obsidian">
                    {formatKoboToNaira(item.totalKobo)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-baseline text-sm">
              <span className="font-semibold uppercase tracking-wider text-xs text-obsidian">Total Paid:</span>
              <span className="font-serif text-lg font-bold text-oxblood">
                {formatKoboToNaira(order.totalKobo)}
              </span>
            </div>
          </div>

          {/* Timeline Events */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-line">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
                Order Activity Timeline
              </h3>
              <div className="space-y-3">
                {order.timeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-obsidian">{event.title}</p>
                      <p className="text-obsidian-muted text-[11px]">{event.description}</p>
                      <span className="text-[10px] text-obsidian-subtle">
                        {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

