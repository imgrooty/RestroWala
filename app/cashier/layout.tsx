"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Calculator } from "lucide-react";

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Calculator className="text-white h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none">POS<span className="text-indigo-600">TERMINAL</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register #01</p>
                        <p className="text-xs font-bold text-emerald-600">Onlinne</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block" />
                    <LogoutButton />
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}
