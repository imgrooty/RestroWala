"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { ChefHat, ClipboardList, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/kitchen/orders",
      label: "Live Orders",
      icon: <ClipboardList className="h-4 w-4" />,
      active: pathname?.startsWith("/kitchen/orders") ?? false,
    },
    {
      href: "/kitchen/menu",
      label: "Menu Availability",
      icon: <UtensilsCrossed className="h-4 w-4" />,
      active: pathname?.startsWith("/kitchen/menu") ?? false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ChefHat className="text-white h-7 w-7" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-white tracking-tight leading-none">KITCHEN<span className="text-orange-500">OS</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display System</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                link.active
                  ? "bg-orange-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <LogoutButton variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700" />
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 bg-slate-800 border-b border-slate-700 px-4 pb-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              link.active
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <main>
        {children}
      </main>
    </div>
  );
}

