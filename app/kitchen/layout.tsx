"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { ChefHat } from "lucide-react";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        <div className="flex items-center gap-6">
          <LogoutButton variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700" />
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}
