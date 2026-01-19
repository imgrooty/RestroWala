"use client";

import { useEffect, useState } from 'react';
import { getRestaurants, createRestaurant } from '../actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Building2, MoreVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        const res = await getRestaurants();
        if (res.success) {
            setRestaurants(res.data || []);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const handleCreate = async (formData: FormData) => {
        const res = await createRestaurant(formData);
        if (res.success) {
            toast({ title: "Success", description: "Restaurant created successfully" });
            fetchRestaurants();
            setIsDialogOpen(false);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Multi-Tenancy</h1>
                    <p className="text-slate-500 font-medium">Manage restaurant instances</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-indigo-200">
                            <Plus className="mr-2 h-5 w-5" /> Add Instance
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900">New Restaurant</DialogTitle>
                            <DialogDescription>Deploy a new RestroWala instance.</DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="font-bold">Name</Label>
                                    <Input id="name" name="name" placeholder="E.g. The Sapphire Grill" required className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="font-bold">Slug (ID)</Label>
                                    <Input id="slug" name="slug" placeholder="e.g. sapphire-grill" required className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold">Contact Email</Label>
                                <Input id="email" name="email" type="email" placeholder="contact@domain.com" required className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="font-bold">Phone</Label>
                                <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="font-bold">Address</Label>
                                <Input id="address" name="address" placeholder="123 Main St" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-bold">Description</Label>
                                <Textarea id="description" name="description" placeholder="Short description..." className="rounded-xl" />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg">
                                Deploy Instance
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest pl-8 py-6">Instance</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Manager</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Metrics</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : restaurants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                                        No active instances found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                restaurants.map((res) => (
                                    <TableRow key={res.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg">{res.name}</p>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{res.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {res.staff[0] ? (
                                                <div>
                                                    <p className="font-bold text-slate-700">{res.staff[0].name}</p>
                                                    <p className="text-xs text-slate-400">{res.staff[0].email}</p>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">Unassigned</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">{res._count.menuItems} Items</Badge>
                                                <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-none">{res._count.orders} Orders</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border-none px-3 py-1 ${res.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-500 text-white'}`}>
                                                {res.isActive ? 'Active' : 'Offline'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl">
                                                    <DropdownMenuItem className="font-medium p-3 rounded-lg focus:bg-indigo-50 text-indigo-700">View Dashboard</DropdownMenuItem>
                                                    <DropdownMenuItem className="font-medium p-3 rounded-lg focus:bg-slate-50 text-slate-700">Settings</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
