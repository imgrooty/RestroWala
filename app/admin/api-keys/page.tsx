"use client";

import { Key } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ApiKeysPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">API Keys</h1>
                    <p className="text-slate-500 font-medium">Manage third-party integration access tokens</p>
                </div>
                <Badge className="bg-indigo-600 text-white font-bold px-4 py-2 text-lg">
                    <Key className="mr-2 h-5 w-5" /> API
                </Badge>
            </div>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-12 text-center">
                    <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Key className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">API Management</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        This module is currently under development. Soon you will be able to generate and manage API keys for third-party integrations and custom clients.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
