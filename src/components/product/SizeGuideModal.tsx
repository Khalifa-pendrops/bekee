import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Ruler, Sparkles } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType?: "clothing" | "shoes" | "bags" | "accessories";
}

export function SizeGuideModal({
  isOpen,
  onClose,
  categoryType = "clothing",
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"clothing" | "shoes">(
    categoryType === "shoes" ? "shoes" : "clothing"
  );
  const [unit, setUnit] = useState<"cm" | "in">("cm");

  const clothingSizes = [
    { uk: "UK 6", us: "US 2", bustCm: "80 - 83", bustIn: "31.5 - 32.5", waistCm: "62 - 65", waistIn: "24.5 - 25.5", hipCm: "87 - 90", hipIn: "34 - 35.5" },
    { uk: "UK 8", us: "US 4", bustCm: "84 - 87", bustIn: "33 - 34", waistCm: "66 - 69", waistIn: "26 - 27", hipCm: "91 - 94", hipIn: "36 - 37" },
    { uk: "UK 10", us: "US 6", bustCm: "88 - 91", bustIn: "34.5 - 36", waistCm: "70 - 73", waistIn: "27.5 - 28.5", hipCm: "95 - 98", hipIn: "37.5 - 38.5" },
    { uk: "UK 12", us: "US 8", bustCm: "92 - 96", bustIn: "36.5 - 38", waistCm: "74 - 78", waistIn: "29 - 30.5", hipCm: "99 - 103", hipIn: "39 - 40.5" },
    { uk: "UK 14", us: "US 10", bustCm: "97 - 102", bustIn: "38.5 - 40", waistCm: "79 - 84", waistIn: "31 - 33", hipCm: "104 - 109", hipIn: "41 - 43" },
    { uk: "UK 16", us: "US 12", bustCm: "103 - 108", bustIn: "40.5 - 42.5", waistCm: "85 - 90", waistIn: "33.5 - 35.5", hipCm: "110 - 115", hipIn: "43.5 - 45" },
    { uk: "UK 18", us: "US 14", bustCm: "109 - 114", bustIn: "43 - 45", waistCm: "91 - 96", waistIn: "36 - 38", hipCm: "116 - 121", hipIn: "45.5 - 47.5" },
    { uk: "UK 20", us: "US 16", bustCm: "115 - 120", bustIn: "45.5 - 47", waistCm: "97 - 102", waistIn: "38.5 - 40", hipCm: "122 - 127", hipIn: "48 - 50" },
  ];

  const shoeSizes = [
    { eu: "EU 36", uk: "UK 3", us: "US 5.5", footCm: "22.5 - 23.0", footIn: "8.9 - 9.1" },
    { eu: "EU 37", uk: "UK 4", us: "US 6.5", footCm: "23.1 - 23.5", footIn: "9.1 - 9.3" },
    { eu: "EU 38", uk: "UK 5", us: "US 7.5", footCm: "23.6 - 24.2", footIn: "9.3 - 9.5" },
    { eu: "EU 39", uk: "UK 6", us: "US 8.5", footCm: "24.3 - 24.8", footIn: "9.6 - 9.8" },
    { eu: "EU 40", uk: "UK 7", us: "US 9.0", footCm: "24.9 - 25.5", footIn: "9.8 - 10.0" },
    { eu: "EU 41", uk: "UK 8", us: "US 9.5", footCm: "25.6 - 26.2", footIn: "10.1 - 10.3" },
    { eu: "EU 42", uk: "UK 9", us: "US 10.5", footCm: "26.3 - 27.0", footIn: "10.4 - 10.6" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sizing & Fit Guide"
      description="Standard UK & EU size standards for Arubekee Collection garments and footwear"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Category Switcher & Unit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-line pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("clothing")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === "clothing"
                  ? "bg-oxblood text-ivory-light"
                  : "bg-ivory-muted text-obsidian hover:bg-stone-line/70"
              }`}
            >
              Clothing (UK)
            </button>
            <button
              onClick={() => setActiveTab("shoes")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === "shoes"
                  ? "bg-oxblood text-ivory-light"
                  : "bg-ivory-muted text-obsidian hover:bg-stone-line/70"
              }`}
            >
              Footwear (EU)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-ivory-muted p-1 border border-stone-line self-start sm:self-auto">
            <button
              onClick={() => setUnit("cm")}
              className={`px-2.5 py-1 text-xs font-medium ${
                unit === "cm" ? "bg-ivory text-obsidian font-bold shadow-xs" : "text-obsidian-subtle"
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              onClick={() => setUnit("in")}
              className={`px-2.5 py-1 text-xs font-medium ${
                unit === "in" ? "bg-ivory text-obsidian font-bold shadow-xs" : "text-obsidian-subtle"
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Clothing Table */}
        {activeTab === "clothing" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-line bg-ivory-warm text-obsidian-soft uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">UK Size</th>
                  <th className="py-2.5 px-3 font-semibold">US Equiv.</th>
                  <th className="py-2.5 px-3 font-semibold">Bust ({unit})</th>
                  <th className="py-2.5 px-3 font-semibold">Waist ({unit})</th>
                  <th className="py-2.5 px-3 font-semibold">Hips ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-line/60">
                {clothingSizes.map((row) => (
                  <tr key={row.uk} className="hover:bg-ivory-muted/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-oxblood">{row.uk}</td>
                    <td className="py-2.5 px-3 text-obsidian-muted">{row.us}</td>
                    <td className="py-2.5 px-3 font-mono">{unit === "cm" ? row.bustCm : row.bustIn}</td>
                    <td className="py-2.5 px-3 font-mono">{unit === "cm" ? row.waistCm : row.waistIn}</td>
                    <td className="py-2.5 px-3 font-mono">{unit === "cm" ? row.hipCm : row.hipIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shoes Table */}
        {activeTab === "shoes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-line bg-ivory-warm text-obsidian-soft uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">EU Size</th>
                  <th className="py-2.5 px-3 font-semibold">UK Size</th>
                  <th className="py-2.5 px-3 font-semibold">US Size</th>
                  <th className="py-2.5 px-3 font-semibold">Foot Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-line/60">
                {shoeSizes.map((row) => (
                  <tr key={row.eu} className="hover:bg-ivory-muted/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-oxblood">{row.eu}</td>
                    <td className="py-2.5 px-3 text-obsidian">{row.uk}</td>
                    <td className="py-2.5 px-3 text-obsidian-muted">{row.us}</td>
                    <td className="py-2.5 px-3 font-mono">{unit === "cm" ? row.footCm : row.footIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* How to Measure Callout */}
        <div className="bg-ivory-muted p-4 border border-stone-line space-y-2 text-xs">
          <div className="flex items-center gap-2 text-oxblood font-semibold uppercase tracking-wider">
            <Ruler className="w-4 h-4" />
            <span>How to Measure Accurately</span>
          </div>
          <p className="text-obsidian-muted leading-relaxed">
            • <strong>Bust:</strong> Measure around the fullest part of your bust holding the tape level.<br />
            • <strong>Waist:</strong> Measure around your natural waistline, keeping tape comfortably loose.<br />
            • <strong>Hips:</strong> Measure around the fullest part of your hips and bottom (approx. 20cm below waist).<br />
            • If you fall between sizes or have fuller hips/bust, we recommend taking the larger size or contacting our Aba team on WhatsApp for custom consultation.
          </p>
        </div>
      </div>
    </Modal>
  );
}

