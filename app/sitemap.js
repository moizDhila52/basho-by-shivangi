import { prisma } from "@/lib/db";

export default async function sitemap() {
  // 1. Define your base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://basho-by-shivangi.vercel.app';

  // 2. Fetch all dynamic data from Prisma
  // FIXED: Changed 'db' to 'prisma' here
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // FIXED: Changed 'db' to 'prisma' here
  const workshops = await prisma.workshop.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // 3. Create the Product URLs
  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Create the Workshop URLs
  const workshopEntries = workshops.map((workshop) => ({
    url: `${baseUrl}/workshops/${workshop.slug}`,
    lastModified: workshop.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 5. Define your Static Pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workshops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/artisans`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ];

  // 6. Return the combined array
  return [...staticRoutes, ...productEntries, ...workshopEntries];
}