'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShoppingBag, Minus, Plus, Search, Utensils, ChefHat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
}

export default function DineInPage() {
    const params = useParams();
    const { toast } = useToast();

    // State
    const [restaurant, setRestaurant] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    // Derived
    const slug = (params?.slug as string) || '';
    const tableId = (params?.tableId as string) || '';
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        if (slug) fetchInfo();
    }, [slug]);

    const fetchInfo = async () => {
        try {
            // Fetch Menu (which should handle calling by slug implicitly via filtering or a public endpoint)
            // Note: Our API currently supports 'slug' param for public access
            const res = await fetch(`/api/menu?slug=${slug}`);
            const data = await res.json();

            if (data.data) {
                setMenuItems(data.data);
                setCategories(data.categories || []);
                // Infer restaurant from menu item or separate call? 
                // Currently API doesn't return restaurant details directly in /api/menu except implicitly
                // Let's assume the first item has restaurantId, but we might want restaurant name.
                // For now, hardcode or fetch separately?
                // Actually, let's fetch table details to verify valid table + get restaurant name relative to table
                fetchTable();
            }
        } catch {
            console.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const fetchTable = async () => {
        // We'll need a public table endpoint or similar.
        // For now, reusing /api/tables might strictly require auth.
        // We might need to upgrade /api/tables to allow public access by ID if we want to valid.
        // Or just rely on URL.
        // For UI polish, let's just use the Slug as the title for now.
        setRestaurant({ name: slug, slug });
    };

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item.id);
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
        toast({ title: "Added to cart", description: `${item.name}` });
    };



    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.menuItemId === itemId) {
                const newQty = Math.max(0, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const placeOrder = async () => {
        if (!customerName) {
            toast({ title: "Name required", description: "Please enter your name for the order.", variant: "destructive" });
            return;
        }

        setPlacingOrder(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                    tableId,
                    customerName,
                    restaurantSlug: slug // Optional, backend might infer from table
                })
            });

            if (!res.ok) throw new Error("Failed to place order");

            toast({ title: "Order Placed!", description: "The kitchen has received your order." });
            setCart([]);
            setIsCartOpen(false);
        } catch {
            toast({ title: "Error", description: "Could not place order. Try again.", variant: "destructive" });
        } finally {
            setPlacingOrder(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchCat = activeCategory === 'all' || item.categoryId === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) return <div className="h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin h-12 w-12" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-slate-900 capitalize leading-none">{restaurant?.slug || 'Restaurant'}</h1>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">Table {tableId.slice(-4)}</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-full cursor-pointer" onClick={() => setIsCartOpen(true)}>
                    <div className="relative">
                        <ShoppingBag className="text-slate-700 h-6 w-6" />
                        {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{totalItems}</span>}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-4 space-y-6">
                {/* Search & Filter */}
                <div className="sticky top-20 z-10 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Search menu..."
                            className="rounded-xl h-12 pl-10 border-none shadow-md bg-white/90 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <Badge
                            variant={activeCategory === 'all' ? 'default' : 'outline'}
                            className={`rounded-xl px-4 py-2 h-auto text-sm cursor-pointer whitespace-nowrap ${activeCategory === 'all' ? 'bg-slate-900' : 'bg-white border-none shadow-sm'}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            All Items
                        </Badge>
                        {categories.map(cat => (
                            <Badge
                                key={cat.id}
                                variant={activeCategory === cat.id ? 'default' : 'outline'}
                                className={`rounded-xl px-4 py-2 h-auto text-sm cursor-pointer whitespace-nowrap ${activeCategory === cat.id ? 'bg-slate-900' : 'bg-white border-none shadow-sm'}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardContent className="p-0 flex h-32">
                                <div className="w-32 bg-slate-200 shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Utensils className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                                            <span className="font-black text-primary">${item.price}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                                    </div>
                                    <Button size="sm" className="self-end rounded-lg h-8 px-4 font-bold bg-slate-900" onClick={() => addToCart(item)}>
                                        Add <Plus className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Cart Sheet / Dialog (Mobile Friendly) */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Your Order</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 space-y-4 py-4 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.menuItemId} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                        <p className="text-sm text-primary font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-white shadow-sm" onClick={() => updateQuantity(item.menuItemId, -1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-white shadow-sm" onClick={() => updateQuantity(item.menuItemId, 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-black text-slate-900">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guestName">Guest Name</Label>
                            <Input
                                id="guestName"
                                placeholder="Enter your name"
                                className="rounded-xl"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                            disabled={cart.length === 0 || placingOrder}
                            onClick={placeOrder}
                        >
                            {placingOrder ? <Loader2 className="animate-spin mr-2" /> : <ChefHat className="mr-2 h-5 w-5" />}
                            Place Order
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
