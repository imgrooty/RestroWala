'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ChefHat,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Sparkles,
  UtensilsCrossed,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { signOutAllSessions } from '@/lib/client-signout';

const NAV_ITEMS = [
  { label: 'Intelligence', icon: LayoutDashboard, href: '/manager/dashboard' },
  { label: 'Staff Orchestra', icon: Users, href: '/manager/staff' },
  { label: 'Live Orders', icon: ClipboardList, href: '/manager/orders' },
  { label: 'Menu Forge', icon: ChefHat, href: '/manager/menu-management' },
  { label: 'Tables & QR', icon: Grid, href: '/manager/tables' }, // Added Table Management
  { label: 'Market Metrics', icon: BarChart3, href: '/manager/analytics' },
  { label: 'Configuration', icon: Settings, href: '/manager/settings' },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Overlay */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <UtensilsCrossed className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-900 tracking-tight leading-none">Gourmet<span className="text-primary">OS</span></span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Commander</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold group ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}>
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`} />
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Section Bottom */}
          <div className="pt-6 border-t border-slate-50">
            <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary font-black">
                {session?.user?.name?.[0] || 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{session?.user?.name || 'Manager'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                onClick={() => signOutAllSessions()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden md:block w-72 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Audit logs, orders, or staff..."
                className="pl-12 h-11 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Pro Account
            </div>

            <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl hover:bg-slate-50">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 rounded-[2rem] p-4 border-none shadow-2xl mt-4" align="end">
                <DropdownMenuLabel className="text-lg font-black px-4 pt-2">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <div className="space-y-2 p-2">
                  <p className="text-center text-slate-400 py-6 text-sm font-medium font-italic">No urgent alerts at this moment.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-3 pl-2 pr-4 h-11 rounded-2xl hover:bg-slate-50">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                    {session?.user?.name?.[0] || 'M'}
                  </div>
                  <span className="text-sm font-black text-slate-700">{session?.user?.name?.split(' ')[0] || 'Manager'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-[1.5rem] p-2 border-none shadow-2xl mt-2" align="end">
                <DropdownMenuItem className="rounded-xl font-bold py-2 focus:bg-slate-50">Profile Settings</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl font-bold py-2 focus:bg-slate-50">Subscription</DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 mx-2" />
                <DropdownMenuItem
                  className="rounded-xl font-bold py-2 text-rose-500 focus:bg-rose-50 focus:text-rose-600"
                  onClick={() => signOutAllSessions()}
                >
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
