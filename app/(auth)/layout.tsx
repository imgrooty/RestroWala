/**
 * Auth Layout
 * 
 * Layout for authentication pages (login, register, etc.)
 * - Centered content
 * - Brand logo
 * - No authenticated navigation
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
