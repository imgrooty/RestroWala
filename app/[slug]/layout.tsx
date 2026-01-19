/**
 * Customer Layout
 * 
 * Layout for customer-facing pages
 * - Customer navigation header
 * - Cart icon with badge
 * - Footer
 * - Guest access by default
 */

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
