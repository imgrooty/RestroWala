'use client';

import React, { useState, useEffect } from 'react';
import ModelUploader from '@/components/manager/ModelUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Package, Plus, Save, Trash2, Box, Loader2 } from 'lucide-react';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [itemsSubmitting, setItemsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    model3dUrl: '',
    modelMetadata: null as any
  });

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.data) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load menu", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Missing fields",
        description: "Please enter at least a name and price.",
        variant: "destructive"
      });
      return;
    }

    setItemsSubmitting(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          price: newItem.price // API parses float
        })
      });

      if (!res.ok) throw new Error("Failed to create item");

      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to the menu.`
      });

      setIsAdding(false);
      setNewItem({ name: '', description: '', price: '', model3dUrl: '', modelMetadata: null });
      fetchMenu();
    } catch (_error) {
      toast({ title: "Error", description: "Could not save item", variant: "destructive" });
    } finally {
      setItemsSubmitting(false);
    }
  };

  const removeItem = (id: string) => {
    // TODO: Implement DELETE API
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item removed from view (Persistence pending DELETE API)"
    });
  };

  if (isLoading) {
    return <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-purple-600" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Menu Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your digital menu items and 3D experiences.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 px-6 py-6 rounded-xl text-lg transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </Button>
      </div>

      {isAdding && (
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Package className="w-6 h-6 text-purple-600" />
              New Menu Item Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-slate-500">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Signature Truffle Burger"
                  className="h-12 text-lg rounded-xl border-slate-200 focus:ring-purple-500"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-slate-500">Description</Label>
                <Input
                  id="description"
                  placeholder="Tell your customers more about this dish..."
                  className="h-12 text-lg rounded-xl border-slate-200 focus:ring-purple-500"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-bold uppercase tracking-wider text-slate-500">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="h-12 text-lg rounded-xl border-slate-200 focus:ring-purple-500"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">3D Asset Management</Label>
              <ModelUploader
                onUploadComplete={(url: string, meta: any) => setNewItem({ ...newItem, model3dUrl: url, modelMetadata: meta })}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-6 flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="px-8 rounded-xl h-12">Cancel</Button>
            <Button onClick={handleAdd} disabled={itemsSubmitting} className="bg-purple-600 hover:bg-purple-700 px-10 rounded-xl h-12 font-bold shadow-lg shadow-purple-500/30">
              {itemsSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Item</>}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <Card key={item.id} className="group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {item.model3dUrl ? (
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500">
                  <div className="bg-slate-100 w-full h-full flex items-center justify-center">
                    <Box className="w-12 h-12 text-purple-300 group-hover:animate-bounce" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">3D Enabled</span>
                </div>
              </div>
            ) : (
              <div className="h-48 bg-slate-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-slate-300" />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                </div>
                <p className="font-black text-purple-600 text-xl">${Number(item.price).toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter className="p-6 border-t border-slate-50 flex justify-between gap-4">
              <Button variant="outline" className="flex-1 rounded-xl h-11 border-slate-200">Edit</Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:bg-red-50 rounded-xl h-11 w-11"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {menuItems.length === 0 && !isAdding && (
          <div className="col-span-full h-96 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-400">No menu items yet</h2>
            <p className="text-slate-400 mt-2">Get started by adding your first signature dish.</p>
          </div>
        )}
      </div>
    </div>
  );
}
