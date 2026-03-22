"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { signOutEverywhere } from "@/lib/client-signout";

interface LogoutButtonProps {
    variant?: "default" | "ghost" | "icon";
    className?: string;
}

export function LogoutButton({ variant = "default", className }: LogoutButtonProps) {
    const handleLogout = async () => {
        await signOutEverywhere("/login");
    };

    if (variant === "icon") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className={`text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ${className}`}
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Log Out</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Log Out</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Button
            variant={variant === "ghost" ? "ghost" : "default"}
            onClick={handleLogout}
            className={`gap-2 font-bold ${variant === "ghost"
                    ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
                } ${className}`}
        >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
        </Button>
    );
}
