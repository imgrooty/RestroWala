/**
 * Kitchen Layout
 * 
 * Layout for kitchen staff interface
 * - Minimal navigation
 * - Large text for visibility
 * - Status indicators
 * - Protected route (requires KITCHEN_STAFF role)
 */

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        {/* Kitchen header will be implemented */}
      </header>
      
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
