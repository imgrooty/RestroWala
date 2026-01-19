"use client";

import { useEffect, useState } from 'react';
import { getSystemLogs } from '../actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Activity, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface SystemLog {
    id: string;
    event: string;
    level: string;
    message: string;
    userId: string | null;
    user: {
        name: string | null;
        email: string;
    } | null;
    userName: string | null;
    userEmail: string | null;
    createdAt: Date;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const res = await getSystemLogs();
        if (res.success) {
            setLogs(res.data || []);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'ERROR':
                return <Badge className="bg-rose-500 text-white border-none"><ShieldAlert className="w-3 h-3 mr-1" /> ERROR</Badge>;
            case 'WARN':
                return <Badge className="bg-amber-500 text-white border-none"><AlertTriangle className="w-3 h-3 mr-1" /> WARN</Badge>;
            case 'INFO':
            default:
                return <Badge className="bg-blue-500 text-white border-none"><Info className="w-3 h-3 mr-1" /> INFO</Badge>;
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Logs</h1>
                    <p className="text-slate-500 font-medium">Real-time audit trail and error tracking</p>
                </div>
                <Badge className="bg-slate-900 text-white font-bold px-4 py-2 text-lg">
                    <Activity className="mr-2 h-5 w-5" /> {logs.length} Events
                </Badge>
            </div>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest pl-8 py-6">Timestamp</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Level</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Event</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">Message</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-widest">User</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-20 text-center">
                                            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-8 py-4 font-mono text-xs text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {getLevelBadge(log.level)}
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-700">
                                            {log.event}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm text-slate-600 truncate" title={log.message}>
                                                {log.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {log.user ? (
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{log.user.name}</p>
                                                    <p className="text-xs text-slate-400">{log.user.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic">System</span>
                                            )}
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
