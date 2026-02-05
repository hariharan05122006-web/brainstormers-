"use client";

import { useAuth } from "./auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Settings, LogOut, CheckSquare, BarChart3, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const { user, signOut } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function getRole() {
            if (user) {
                const supabase = createClient();
                const { data } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                if (data) setRole(data.role);
            }
        }
        getRole();
    }, [user]);

    const links = [
        { name: "Overview", href: `/dashboard/${role}`, icon: LayoutDashboard, roles: ["citizen", "officer", "admin"] },
        { name: "My Complaints", href: "/dashboard/citizen/complaints", icon: FileText, roles: ["citizen"] },
        { name: "Assigned Tasks", href: "/dashboard/officer/tasks", icon: CheckSquare, roles: ["officer"] },
        { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3, roles: ["admin"] },
        { name: "Users", href: "/dashboard/admin/users", icon: Users, roles: ["admin"] },
        { name: "Home", href: "/", icon: Home, roles: ["citizen", "officer", "admin"] },
    ];

    const filteredLinks = links.filter(l => role && l.roles.includes(role));

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="h-screen w-64 bg-secondary/50 border-r border-border flex flex-col fixed left-0 top-0 z-40"
        >
            <div className="p-6 border-b border-border/50">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-lg">C</span>
                    CivicConnect
                </h1>
                <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">
                    {role || "Loading..."} Workspace
                </p>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-6">
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all font-medium text-sm group relative",
                                isActive
                                    ? "bg-white shadow-sm text-foreground border border-border"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon size={18} className={isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </motion.div>
    );
}
