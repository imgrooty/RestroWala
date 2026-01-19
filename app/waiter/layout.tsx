/**
 * Waiter Layout
 * 
 * Layout for waiter interface
 * - Simple navigation
 * - Quick action buttons
 * - Notification badge
 * - Protected route (requires WAITER role)
 */

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        {/* Waiter navigation will be implemented */}
      </header>
      
      <main className="container mx-auto py-4">
        {children}
      </main>
    </div>
  );
}
