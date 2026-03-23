'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Table, AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const { items, removeItem, updateQuantity, total, clearCart, itemCount, isLoading: cartLoading } = useCart(slug);
  const { toast } = useToast();
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handlePlaceOrder = async () => {
    if (!tableNumber || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please enter both your name and table number.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Find table ID by number scoped to this restaurant slug
      const tableResponse = await fetch(`/api/tables?number=${tableNumber}&slug=${slug}`);
      const tableData = await tableResponse.json();

      const tableId = tableData.tables?.[0]?.id;
      if (!tableId) {
        throw new Error("Invalid table number for this restaurant");
      }

      const response = await fetch(`/api/orders?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          customerName,
          items: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || ''
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to place order");

      const orderData = await response.json();
      setOrderComplete(true);
      clearCart();
      toast({
        title: "Order Placed!",
        description: `Your order #${orderData.order.orderNumber} is being prepared.`,
      });

      // Redirect after 3 seconds to the localized order page
      setTimeout(() => {
        router.push(`/${slug}/order/${orderData.order.id}`);
      }, 3000);

    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-2xl animate-in zoom-in duration-500">
          <div className="mx-auto bg-green-100 h-20 w-20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Order Confirmed!</CardTitle>
          <p className="text-muted-foreground mb-8">Your delicious order is now in the kitchen. We'll notify you when it's ready.</p>
          <div className="space-y-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm font-medium text-primary">Redirecting to order tracker...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-muted-foreground">{itemCount} items ready for perfection.</p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.menuItemId} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex p-4 gap-4">
                    <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <ShoppingCart className="h-12 w-12 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.menuItemId)} className="h-8 w-8 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="h-8 w-8 rounded-full border-gray-200">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="h-8 w-8 rounded-full border-gray-200">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="pt-4">
                <Link href={`/${slug}/menu`}>
                  <Button variant="link" className="p-0 text-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add more items
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-lg">Checkout Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        <Users className="h-4 w-4" />
                        Customer Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. John Doe"
                        className="h-12 rounded-xl border-slate-200 focus:ring-primary text-lg font-bold"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="table" className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        <Table className="h-4 w-4" />
                        Table Number
                      </Label>
                      <Input
                        id="table"
                        placeholder="e.g. 12"
                        className="h-12 rounded-xl border-slate-200 focus:ring-primary text-lg font-bold"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Required to bring your food to you.
                      </p>
                    </div>
                  </div>

                  <div className="divider border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Service Fee (5%)</span>
                      <span>${(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black text-slate-900 pt-2">
                      <span>Total</span>
                      <span>${(total * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-slate-50 border-t border-slate-100">
                  <Button
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || items.length === 0 || !customerName || !tableNumber}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <>
                        Confirm Order
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-400">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
            <Link href={`/${slug}/menu`}>
              <Button className="mt-8 rounded-xl px-10 h-12 font-bold shadow-lg shadow-primary/20">
                Explore Menu
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
