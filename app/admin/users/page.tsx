"use client";

import { useEffect, useState } from 'react';
import { getGlobalUsers, manageUserStatus, updateUserRole } from '../actions';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, MoreVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await getGlobalUsers();
        if (res.success) {
            setUsers(res.data || []);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        const res = await manageUserStatus(userId, !currentStatus);
        if (res.success) {
            toast({ title: "Success", description: "User status updated" });
            fetchUsers();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const res = await updateUserRole(userId, newRole);
        if (res.success) {
            toast({ title: "Success", description: "User role updated" });
            fetchUsers();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium">Global user roles and permissions audit</p>
                </div>
                <Badge className="bg-indigo-600 text-white font-bold px-4 py-2 text-lg">
                    <Users className="mr-2 h-5 w-5" /> {users.length} Users
                </Badge>
            </div>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest pl-8 py-6">User</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Restaurant</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Role</TableHead>
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg">{user.name || 'Unnamed'}</p>
                                                    <p className="text-xs font-bold text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.restaurant ? (
                                                <p className="font-bold text-slate-700">{user.restaurant.name}</p>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">Global</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={user.role}
                                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                            >
                                                <SelectTrigger className="w-[180px] border-none bg-slate-50 font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                                    <SelectItem value="KITCHEN_STAFF">Kitchen Staff</SelectItem>
                                                    <SelectItem value="WAITER">Waiter</SelectItem>
                                                    <SelectItem value="CASHIER">Cashier</SelectItem>
                                                    <SelectItem value="CLEANER">Cleaner</SelectItem>
                                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border-none px-3 py-1 ${user.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-500 text-white'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
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
                                                    <DropdownMenuItem
                                                        className="font-medium p-3 rounded-lg focus:bg-indigo-50 text-indigo-700"
                                                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                                                    >
                                                        {user.isActive ? 'Deactivate' : 'Activate'} User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="font-medium p-3 rounded-lg focus:bg-slate-50 text-slate-700">
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="font-medium p-3 rounded-lg focus:bg-rose-50 text-rose-700">
                                                        Delete User
                                                    </DropdownMenuItem>
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
