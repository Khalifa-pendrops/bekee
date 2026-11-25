import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || '';
    const id = searchParams.get('id') || '';

    let product = null;
    if (slug) {
      product = await db.getProductBySlug(slug);
    } else if (id) {
      const all = await db.getProducts({ includeUnpublished: true });
      product = all.find((p) => p.id === id) || null;
    }

    // Extracted attributes with robust fallbacks
    const title = product?.name || searchParams.get('title') || 'Arubekee Curated Fashion';
    const rawLowestKobo = product 
      ? Math.min(...product.variants.map((v) => v.salePriceKobo || v.priceKobo))
      : 3500000;
    const priceFormatted = formatKoboToNaira(rawLowestKobo);

    const primaryImage = product?.images.find((img) => img.isPrimary) || product?.images[0];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://arubekeecollection.vercel.app';

    let imageUrl = primaryImage?.url || searchParams.get('img') || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    if (!imageUrl) {
      imageUrl = `${siteUrl}/asset/80772648-ba30-4794-a044-2de173b5fc1f.jpg`;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#3E0C13',
            backgroundImage: 'radial-gradient(circle at 75% 25%, #6B1724 0%, #3E0C13 70%)',
            padding: '40px',
            fontFamily: 'serif',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Outer Gold Atelier Border */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: '2px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '24px',
              display: 'flex',
              pointerEvents: 'none',
            }}
          />

          {/* Left Editorial Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '30px 40px 30px 20px',
              zIndex: 10,
            }}
          >
            {/* Header Brand Seal */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid #D4AF37',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    color: '#F4D068',
                    fontSize: '13px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    display: 'flex',
                  }}
                >
                  Crafted in Aba, Abia State
                </div>
              </div>

              <div
                style={{
                  fontSize: '36px',
                  letterSpacing: '6px',
                  color: '#FAF6F0',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                ARUBEKEE
              </div>
              <div
                style={{
                  fontSize: '14px',
                  letterSpacing: '8px',
                  color: '#D4AF37',
                  textTransform: 'uppercase',
                  marginTop: '-4px',
                  display: 'flex',
                }}
              >
                COLLECTION
              </div>
            </div>

            {/* Product Title and Price */}
            <div style={{ display: 'flex', flexDirection: 'column', margin: '20px 0' }}>
              <div
                style={{
                  fontSize: '44px',
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  marginBottom: '18px',
                  maxHeight: '120px',
                  overflow: 'hidden',
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '46px',
                    fontWeight: 700,
                    color: '#F4D068',
                    display: 'flex',
                  }}
                >
                  {priceFormatted}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#EADDCF',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    display: 'flex',
                  }}
                >
                  • Exclusive Atelier Drop
                </span>
              </div>
            </div>

            {/* Concierge & Logistics Footer Badges */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid rgba(234, 221, 207, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#FAF6F0',
                  fontSize: '14px',
                  letterSpacing: '1px',
                }}
              >
                ✨ Free Aba Boutique Pickup
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#FAF6F0',
                  fontSize: '14px',
                  letterSpacing: '1px',
                }}
              >
                🚚 Nationwide Transit
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#25D366',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                💬 WhatsApp Concierge
              </div>
            </div>
          </div>

          {/* Right Product Portrait Frame */}
          <div
            style={{
              width: '440px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              padding: '10px 10px 10px 0',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '3px solid rgba(212, 175, 55, 0.6)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('[API /api/og/product] Error:', error);
    return new Response(`Failed to generate dynamic social sharing card: ${error.message}`, {
      status: 500,
    });
  }
}
