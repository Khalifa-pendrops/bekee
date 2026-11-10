import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arubekee.com';

  const [products, categories, collections] = await Promise.all([
    db.getProducts(),
    db.getCategories(),
    db.getCollections(),
  ]);

  // Static core routes
  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/delivery',
    '/returns',
    '/terms',
    '/privacy',
    '/size-guide',
    '/track-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Categories
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Collections
  const collectionRoutes = collections.map((col) => ({
    url: `${baseUrl}/collections/${col.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Products
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt || prod.createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...productRoutes];
}

