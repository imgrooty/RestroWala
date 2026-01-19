'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Loader2,
  Edit,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UserRole } from '@/types/prisma';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: UserRole.WAITER,
    phone: ''
  });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/staff');
      const data = await response.json();
      if (data.data) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create staff member');
      }

      toast({
        title: 'Success',
        description: `${formData.name} added to the team!`,
      });

      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.WAITER,
        phone: ''
      });
      fetchStaff();
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MANAGER': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Manager</Badge>;
      case 'KITCHEN_STAFF': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Kitchen</Badge>;
      case 'WAITER': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Waiter</Badge>;
      case 'CASHIER': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Cashier</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Staff Orchestra
          </h1>
          <p className="text-slate-500 font-medium">Manage your restaurant's human capital and performance across roles.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 gap-2">
              <UserPlus className="h-5 w-5" />
              Empower New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Add Team Member</DialogTitle>
              <DialogDescription>
                Create credentials for a new staff member. They can use these to log into their specific dashboard.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Display Name</Label>
                  <Input
                    id="add-name"
                    placeholder="e.g. Gordon Ramsay"
                    className="rounded-xl h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">Work Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="name@gourmetos.com"
                    className="rounded-xl h-12"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Initial Password</Label>
                  <Input
                    id="add-password"
                    type="password"
                    className="rounded-xl h-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-role">Assignment Role</Label>
                  <Select
                    onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                    defaultValue={formData.role as string}
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={UserRole.WAITER}>Waiter (Floor Operations)</SelectItem>
                      <SelectItem value={UserRole.KITCHEN_STAFF}>Kitchen (Culinary Ops)</SelectItem>
                      <SelectItem value={UserRole.CASHIER}>Cashier (Financial Ops)</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Manager (Admin Ops)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Contact Phone</Label>
                  <Input
                    id="add-phone"
                    placeholder="+1 (555) 000-0000"
                    className="rounded-xl h-12"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black">Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Force</p>
                <p className="text-2xl font-black text-indigo-700">{staff.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Shifts</p>
                <p className="text-2xl font-black text-emerald-700">85%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by name, role or email..."
              className="pl-12 h-16 rounded-[2rem] bg-white border-none shadow-xl text-lg font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 rounded-[2.5rem] bg-slate-100 animate-pulse" />
              ))
            ) : filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <Card key={member.id} className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden relative">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl">
                          {member.name[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">{member.name}</h3>
                          {getRoleBadge(member.role)}
                        </div>
                      </div>
                      <Badge variant="outline" className={`rounded-full px-3 py-1 ${member.isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                        {member.isActive ? 'Active' : 'On Leave'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Mail size={14} />
                        <span className="font-medium truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Phone size={14} />
                          <span className="font-medium">{member.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" className="flex-1 rounded-xl hover:bg-slate-50 gap-2 font-bold text-slate-500">
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 rounded-xl hover:bg-rose-50 gap-2 font-bold text-rose-500">
                        <Trash size={14} />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <Users className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-xl font-bold text-slate-400">Solitary Operations</h3>
                <p className="text-slate-400 max-w-xs mx-auto">No staff members found matching your search. Add someone to start the orchestra.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
