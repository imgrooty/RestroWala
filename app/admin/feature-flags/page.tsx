"use client";

import { Flag } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeatureFlagsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Feature Flags</h1>
                    <p className="text-slate-500 font-medium">Control beta feature availability across tenants</p>
                </div>
                <Badge className="bg-indigo-600 text-white font-bold px-4 py-2 text-lg">
                    <Flag className="mr-2 h-5 w-5" /> Beta
                </Badge>
            </div>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-12 text-center">
                    <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Flag className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Feature Control Plane</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        This module is currently under development. Soon you will be able to toggle experimental features for specific restaurant instances.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
