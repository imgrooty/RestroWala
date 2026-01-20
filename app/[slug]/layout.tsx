/**
 * Customer Layout
 * 
 * Layout for customer-facing pages
 * - Customer navigation header
 * - Cart icon with badge
 * - Footer
 * - Guest access by default
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const slug = params.slug;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, description: true, logo: true }
  });

  if (!restaurant) {
    return {
      title: 'Restaurant Not Found',
    };
  }

  return {
    title: {
      default: restaurant.name,
      template: `%s | ${restaurant.name}`
    },
    description: restaurant.description || `Welcome to ${restaurant.name}. View our menu and order online.`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description || `Welcome to ${restaurant.name}. View our menu and order online.`,
      url: `/${slug}`,
      siteName: restaurant.name,
      images: [
        {
          url: `/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.name,
      description: restaurant.description || `Welcome to ${restaurant.name}. View our menu and order online.`,
      images: [`/api/og?slug=${slug}`],
    },
  };
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Navigation */}
      <header className="bg-white shadow-sm">
        {/* Navigation will be implemented */}
      </header>

      <main className="container mx-auto py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        {/* Footer will be implemented */}
      </footer>
    </div>
  );
}
