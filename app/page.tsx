import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChefHat, Utensils, ArrowRight, Zap, Globe, Users, Star, Clock, ShieldCheck } from 'lucide-react';
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
            <Button variant="ghost" className="font-bold border-none hover:bg-slate-50 hidden sm:flex">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-bold rounded-2xl px-6 bg-primary shadow-xl shadow-primary/20">Start Free Trial</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-32 md:pt-16 md:pb-48 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left z-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full text-xs font-black text-primary uppercase tracking-widest">
              <Zap className="h-3 w-3 fill-current" /> Empowering 500+ Global Kitchens
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
              Master the <br />
              <span className="text-primary italic">Art</span> of Dining <br />
              <span className="text-slate-400">Operations.</span>
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
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 transition-all">
                  Explore Demo Menu
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="bg-slate-900 rounded-[3rem] p-3 shadow-3xl transform rotate-2 hover:rotate-0 transition-all duration-700 relative overflow-hidden">
              <div className="bg-slate-800 h-[500px] w-full rounded-[2.2rem] overflow-hidden border-4 border-slate-700 relative">
                {/* Mockup of a Digital Menu Dashboard */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-32 bg-slate-700 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 bg-primary/20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center gap-2 border border-slate-600">
                      <Image src="/images/categories/pizza.png" width={120} height={120} alt="Pizza" className="rounded-full shadow-lg" />
                      <div className="h-3 w-16 bg-slate-600 rounded mt-2" />
                    </div>
                    <div className="bg-slate-700/50 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center gap-2 border border-slate-600">
                      <Image src="/images/categories/sushi.png" width={120} height={120} alt="Sushi" className="rounded-full shadow-lg" />
                      <div className="h-3 w-16 bg-slate-600 rounded mt-2" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-700 rounded" />
                    <div className="h-4 w-2/3 bg-slate-700 rounded" />
                    <div className="h-20 w-full bg-primary/10 border border-primary/20 rounded-xl flex items-center px-4 gap-4">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-primary/30 rounded" />
                        <div className="h-2 w-full bg-primary/20 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Element */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-20 animate-bounce transition-all duration-1000 hidden xl:block">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Star className="fill-current" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">4.9/5 Rating</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">Customer Trust</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Value Props */}
      <section className="bg-slate-900 py-24 px-6 md:px-12 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzf9rq93b/image/upload/v1711204000/restaurant-bg_z1z1z1.jpg')] opacity-10 bg-cover bg-center" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          <div className="space-y-4 group">
            <div className="h-16 w-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-primary transition-colors">
              <Zap className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">0.5s</p>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Order Latency</p>
            </div>
          </div>
          <div className="space-y-4 group">
            <div className="h-16 w-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-primary transition-colors">
              <Star className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">25%</p>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Higher Tips</p>
            </div>
          </div>
          <div className="space-y-4 group">
            <div className="h-16 w-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-primary transition-colors">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">100%</p>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Digital Accuracy</p>
            </div>
          </div>
          <div className="space-y-4 group">
            <div className="h-16 w-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-primary transition-colors">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">1h</p>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Avg. Setup Time</p>
            </div>
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

          {/* Visual Showcase */}
          <div className="pt-20 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Visual Menu Excellence</h3>
                <p className="text-slate-500 font-medium">Capture appetite with high-definition digital presentations.</p>
              </div>
              <Link href="/the-sapphire-grill/menu">
                <Button variant="outline" className="rounded-xl font-bold border-2">View Full Menu Demo</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Artisan Pasta', img: '/images/categories/pasta.png', desc: 'Hand-made daily' },
                { name: 'Premium Steaks', img: '/images/categories/steaks.png', desc: 'A5 Grade Wagyu' },
                { name: 'Fresh Starters', img: '/images/categories/starters.png', desc: 'Chef favorites' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-slate-100 aspect-[4/3]">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <h4 className="text-white text-xl font-black">{item.name}</h4>
                    <p className="text-slate-200 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Restro<span className="text-primary">Wala</span></span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">
              The complete OS for modern restaurants. From AR menus to real-time kitchen orchestration, we empower hospitality teams to deliver excellence.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-12 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between gap-6">
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} RestroWala Platform. All rights reserved.</p>
          <div className="flex justify-center md:justify-end gap-8 text-sm text-slate-400 font-medium">
            <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-600">Terms of Service</Link>
          </div>
        </div>
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
