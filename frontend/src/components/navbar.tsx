"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { user, signOut } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const pathname = usePathname();

    if (pathname?.startsWith("/dashboard")) return null;

    useEffect(() => {
        async function getRole() {
            if (user) {
                const supabase = createClient();
                const { data } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                if (data) {
                    setRole(data.role);
                }
            }
        }
        getRole();
    }, [user]);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    CivicConnect
                </Link>
                <div className="flex gap-6 items-center">
                    {!user ? (
                        <>
                            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
                            <Link href="/register" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            {role === "citizen" && (
                                <Link href="/dashboard/citizen" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                            )}
                            {role === "officer" && (
                                <Link href="/dashboard/officer" className="text-sm font-medium hover:text-primary transition-colors">Officer Dashboard</Link>
                            )}
                            {role === "admin" && (
                                <Link href="/dashboard/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin Panel</Link>
                            )}
                            <button
                                onClick={signOut}
                                className="px-4 py-2 rounded-full border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-all"
                            >
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
