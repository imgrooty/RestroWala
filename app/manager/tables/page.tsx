'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, LayoutGrid, MapPin, Users, Printer, Loader2 } from 'lucide-react';

export default function TablesPage() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [origin, setOrigin] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        number: '',
        capacity: '4',
        floor: 'Ground',
        location: 'Main Hall'
    });

    useEffect(() => {
        fetchTables();
        setOrigin(window.location.origin);
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables');
            const data = await res.json();
            if (data.data) {
                setTables(data.data);
            }
        } catch {
            toast({ title: "Error", description: "Failed to load tables", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.number) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            toast({ title: "Success", description: "Table created!" });
            setIsDialogOpen(false);
            setFormData({ number: '', capacity: '4', floor: 'Ground', location: 'Main Hall' });
            fetchTables();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const printQR = (tableId: string) => {
        // Create a print window
        const printWindow = window.open('', '', 'width=600,height=600');
        const qrCanvas = document.getElementById(`qr-${tableId}`)?.querySelector('svg');
        if (printWindow && qrCanvas) {
            const qrHtml = qrCanvas.outerHTML;
            // Find table details
            const table = tables.find(t => t.id === tableId);

            printWindow.document.write(`
              <html>
              <head>
                  <title>Table ${table.number} QR</title>
                  <style>
                      body { font-family: sans-serif; text-align: center; padding: 40px; }
                      .qr-container { border: 2px solid black; padding: 20px; display: inline-block; border-radius: 20px; }
                      h1 { margin: 10px 0; font-size: 40px; }
                      p { margin: 5px 0; color: #666; }
                      .logo { font-weight: bold; font-size: 24px; margin-bottom: 20px; }
                  </style>
              </head>
              <body>
                  <div class="logo">${table.restaurant.name}</div>
                  <div class="qr-container">
                      ${qrHtml}
                      <h1>Table ${table.number}</h1>
                      <p>Scan to Order</p>
                  </div>
              </body>
              </html>
          `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Floor Management</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Configure tables and generate QR codes for ordering.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-6 py-6 rounded-xl text-lg font-bold">
                            <Plus className="w-5 h-5 mr-2" />
                            Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">New Table</DialogTitle>
                            <DialogDescription>Add a new table to your floor plan.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="number">Table Number</Label>
                                    <Input id="number" type="number" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input id="capacity" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="floor">Floor / Area</Label>
                                <Input id="floor" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Specific Location</Label>
                                <Input id="location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Near Window" className="rounded-xl" />
                            </div>
                        </div>
                        <Button onClick={handleCreate} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Table'}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                    ))
                ) : tables.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <LayoutGrid className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold">No tables configured yet.</p>
                    </div>
                ) : (
                    tables.map(table => (
                        <Card key={table.id} className="rounded-3xl border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900">#{table.number}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span className="text-sm font-medium">{table.floor} - {table.location}</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="rounded-lg px-2 py-1 text-slate-600 bg-slate-100">
                                            <Users className="h-3 w-3 mr-1" /> {table.capacity}
                                        </Badge>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 justify-between group-hover:border-indigo-100 transition-colors">
                                        <div id={`qr-${table.id}`} className="bg-white">
                                            <QRCodeSVG
                                                value={`${origin}/${table.restaurant.slug}/menu/${table.id}`}
                                                size={80}
                                                level="M"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div className="text-xs text-right space-y-1">
                                            <p className="font-bold text-slate-900">Scan to Order</p>
                                            <p className="text-slate-400 max-w-[100px] truncate">{table.restaurant.slug}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl font-bold border-slate-200 hover:bg-white hover:text-indigo-600" onClick={() => printQR(table.id)}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print QR
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
