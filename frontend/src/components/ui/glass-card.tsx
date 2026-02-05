"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: CardProps) {
    // Renamed internal logic to "CleanCard" style but kept export name for compatibility
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={hoverEffect ? { y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" } : {}}
            className={cn(
                "relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all",
                className
            )}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
