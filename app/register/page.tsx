'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowRight, Building2, User, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

/**
 * Render the two-step restaurant registration page with entity details and owner account forms.
 *
 * Manages local form state (restaurant name/slug and owner name/email/password), step navigation,
 * loading state, slug generation for a friendly URL, and submission to the `/api/saas/register` endpoint.
 * On successful registration it shows a success toast and navigates to `/login`; on failure it shows an error toast.
 *
 * @returns The registration page JSX element
 */
export default function RegisterRestaurantPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        restaurantName: '',
        restaurantSlug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/saas/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            toast({
                title: "Empire Registered!",
                description: "Your restaurant is ready. Redirecting to your dashboard...",
            });

            router.push('/login');
        } catch (err) {
            toast({
                title: "Registration Error",
                description: err instanceof Error ? err.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-40 -mb-40" />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="bg-white h-16 w-16 rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-6">
                        <ChefHat className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Onboard your <br /><span className="text-primary italic">Atmosphere.</span></h1>
                    <p className="text-slate-500 font-medium">Join the GourmetOS network in minutes.</p>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step 01 / 02</p>
                                        <h2 className="text-2xl font-black text-slate-900">Entity Details</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="restaurantName">Restaurant Name</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="restaurantName"
                                                    placeholder="e.g. The Sapphire Grill"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-medium"
                                                    value={formData.restaurantName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            restaurantName: val,
                                                            restaurantSlug: generateSlug(val)
                                                        });
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="restaurantSlug">Custom URL Slug</Label>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 p-4 rounded-xl">
                                                gourmet-os.com/<span className="text-primary">{formData.restaurantSlug || 'your-slug'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="button" onClick={handleNext} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                                        Next Chapter
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step 02 / 02</p>
                                        <h2 className="text-2xl font-black text-slate-900">Guardian Account</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ownerName">Owner Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="ownerName"
                                                    placeholder="Gordon Ramsay"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-medium"
                                                    value={formData.ownerName}
                                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ownerEmail">Professional Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="ownerEmail"
                                                    type="email"
                                                    placeholder="gordon@sapphire.com"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-medium"
                                                    value={formData.ownerEmail}
                                                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ownerPassword">Secure Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="ownerPassword"
                                                    type="password"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-medium"
                                                    value={formData.ownerPassword}
                                                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="ghost" onClick={handleBack} className="h-14 rounded-2xl font-bold">
                                            Back
                                        </Button>
                                        <Button type="submit" className="flex-1 h-14 rounded-2xl font-black text-lg bg-slate-900 shadow-xl shadow-slate-200" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Establish Nexus'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-sm font-medium">
                    Already using GourmetOS? <Link href="/login" className="text-primary font-bold">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
