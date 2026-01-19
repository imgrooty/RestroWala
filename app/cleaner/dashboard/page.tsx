"use client";

import { useState } from 'react';
import { LogoutButton } from "@/components/auth/logout-button";
import { Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CleanerDashboardPage() {
    // Mock data for demo
    const [tasks, setTasks] = useState([
        { id: 1, area: "Table T-12", type: "Spill Cleanup", status: "PENDING", time: "2m ago" },
        { id: 2, area: "Restroom A", type: "Routine Check", status: "PENDING", time: "15m ago" },
        { id: 3, area: "Kitchen Entrance", type: "Mopping", status: "COMPLETED", time: "1h ago" },
    ]);

    const handleComplete = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: "COMPLETED" } : t));
    };

    return (
        <div className="min-h-screen bg-cyan-50/30 p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff <span className="text-cyan-600">Cleanup</span></h1>
                    <p className="text-slate-500 font-bold">Maintenance Crew Portal</p>
                </div>
                <LogoutButton />
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-white rounded-3xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
                            <p className="text-4xl font-black text-cyan-600 mt-1">{tasks.filter(t => t.status === 'PENDING').length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-cyan-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-cyan-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white rounded-3xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p>
                            <p className="text-4xl font-black text-emerald-600 mt-1">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 px-2">Active Requests</h2>
                {tasks.map((task) => (
                    <div key={task.id} className={`p-6 rounded-[2rem] bg-white border-2 transition-all ${task.status === 'PENDING' ? 'border-cyan-100 shadow-lg shadow-cyan-100/50' : 'border-slate-50 opacity-60'
                        }`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${task.status === 'PENDING' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">{task.area}</h3>
                                    <p className="text-sm font-bold text-slate-400">{task.type}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-none bg-slate-50 text-slate-500">{task.time}</Badge>
                        </div>

                        {task.status === 'PENDING' ? (
                            <Button
                                onClick={() => handleComplete(task.id)}
                                className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-bold text-white shadow-lg shadow-cyan-200 text-lg tracking-wide"
                            >
                                Mark Complete
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 h-12 text-emerald-600 font-black uppercase tracking-widest text-sm bg-emerald-50 rounded-xl">
                                <CheckCircle2 className="h-4 w-4" /> Done
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
