import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await db.getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const lowestPriceKobo = Math.min(...product.variants.map((v) => v.salePriceKobo || v.priceKobo));
  const nairaPrice = (lowestPriceKobo / 100).toLocaleString();

  return {
    title: `${product.name} | ARUBEKEE COLLECTION`,
    description: product.description,
    openGraph: {
      title: `${product.name} (₦${nairaPrice}) | ARUBEKEE COLLECTION`,
      description: product.description,
      images: primaryImage ? [{ url: primaryImage.url, alt: primaryImage.altText || product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const settings = await db.getStoreSettings();

  // Fetch related products (same category, excluding current)
  const categoryProducts = await db.getProducts({
    categorySlug: product.categorySlug,
  });
  const relatedProducts = categoryProducts.filter((p) => p.id !== product.id).slice(0, 4);

  // Schema.org Product Structured Data
  const primaryImage = product.images[0]?.url;
  const lowestPrice = Math.min(...product.variants.map((v) => v.salePriceKobo || v.priceKobo)) / 100;
  const inStock = product.variants.some((v) => v.stockQuantity > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: primaryImage,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: {
      "@type": "Brand",
      name: "ARUBEKEE COLLECTION",
    },
    offers: {
      "@type": "Offer",
      url: `https://arubekee.com/products/${product.slug}`,
      priceCurrency: "NGN",
      price: lowestPrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "ARUBEKEE COLLECTION",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProductDetailView
          product={product}
          relatedProducts={relatedProducts}
          settings={settings}
        />
      </div>
    </>
  );
}

