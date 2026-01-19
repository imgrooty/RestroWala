import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Utensils, ArrowRight, Zap, Globe, Users } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role) {
    const roleRedirects: Record<string, string> = {
      'SUPER_ADMIN': '/admin/dashboard',
      'ADMIN': '/manager/dashboard',
      'MANAGER': '/manager/dashboard',
      'KITCHEN_STAFF': '/kitchen/orders',
      'CASHIER': '/cashier/dashboard',
      'WAITER': '/waiter/dashboard',
      'CLEANER': '/cleaner/dashboard',
      'CUSTOMER': '/',
    };

    const targetPath = roleRedirects[session.user.role as string];
    if (targetPath && targetPath !== '/' && session.user.role !== 'CUSTOMER') {
      redirect(targetPath);
    }
  }
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* SaaS Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Restro<span className="text-primary">Wala</span></span>
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm font-bold text-slate-500">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="#demo" className="hover:text-primary transition-colors">Live Demo</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold border-none hover:bg-slate-50">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-bold rounded-2xl px-6 bg-slate-900 shadow-xl shadow-slate-200">Start Free Trial</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-32 md:pt-16 md:pb-48 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-xs font-black text-indigo-600 uppercase tracking-widest">
              <Zap className="h-3 w-3 fill-current" /> Empowering 500+ Restaurants
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              The OS for your <br />
              <span className="text-primary underline decoration-indigo-200 underline-offset-8">Restaurant.</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
              Transform your dining floor with digital orchestration. One platform for menus, staff dashboards, AR experiences, and real-time operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-primary shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                  Register Restaurant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/the-sapphire-grill/menu">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-2xl border-2 hover:bg-slate-50 hover:scale-105 transition-transform">
                  Live Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="bg-slate-900 rounded-[3rem] p-4 shadow-3xl transform rotate-2 hover:rotate-0 transition-all duration-700">
              <div className="bg-white h-[500px] w-full rounded-[2.5rem] overflow-hidden border-8 border-slate-900 flex items-center justify-center text-slate-300 font-black text-4xl italic">
                Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Value Props */}
      <section className="bg-slate-900 py-20 px-6 md:px-12 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">0.5s</p>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Order Latency</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">25%</p>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Higher Tips</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">100%</p>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Digital Accuracy</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">1h</p>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Avg. Setup Time</p>
          </div>
        </div>
      </section>

      {/* SaaS Features */}
      <section id="features" className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Built for scale, tuned for <span className="text-primary italic">hospitality.</span></h2>
            <p className="text-lg text-slate-500 font-medium">Everything you need to run a modern restaurant ecosystem in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Multi-Tenant Architecture"
              description="Deploy independent restaurant instances with custom slugs and dedicated data isolation."
              color="blue"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Role-Based Dashboards"
              description="Crystal clear views for Managers, Waiters, Chefs, and Cashiers, all synced in real-time."
              color="purple"
            />
            <FeatureCard
              icon={<Utensils className="h-6 w-6" />}
              title="Smarter Digital Menus"
              description="Showcase dishes with 3D models and allow guests to order directly via QR codes."
              color="orange"
            />
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Restro<span className="text-primary">Wala</span></span>
        </div>
        <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} RestroWala Platform. All rights reserved.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="p-10 rounded-[3rem] border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all group">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
