"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Coffee } from "lucide-react";

/**
 * Layout component that renders a sticky header with branding and places `children` in the page main area.
 *
 * @param children - Content to render inside the layout's main area
 * @returns The React element containing the page wrapper, header (branding and logout), and the provided `children`
 */
export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Coffee className="text-white h-6 w-6" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">Staff<span className="text-emerald-500">Portal</span></span>
        </div>

        <div className="flex items-center gap-4">
          {/* Placeholder for notifications or other header items */}
          <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden sm:block" />
          <LogoutButton />
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}
