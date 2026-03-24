"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Coffee, LayoutDashboard, ClipboardList, Grid3X3, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/waiter/dashboard", icon: LayoutDashboard },
    { label: "Orders", href: "/waiter/orders", icon: ClipboardList },
    { label: "Tables", href: "/waiter/tables", icon: Grid3X3 },
    { label: "Menu", href: "/waiter/menu", icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Coffee className="text-white h-6 w-6" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">Staff<span className="text-emerald-500">Portal</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden sm:block" />
          <LogoutButton />
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
