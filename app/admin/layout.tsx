"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { Shield } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-100/50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-2xl">
                        <Shield className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-slate-900 tracking-tight leading-none">SUPER<span className="text-indigo-600">ADMIN</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <LogoutButton />
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto">
                {children}
            </main>
        </div>
    );
}
