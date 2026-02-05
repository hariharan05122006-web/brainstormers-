"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", authData.user.id)
                .single();

            const role = profile?.role || "citizen";

            if (role === 'admin') router.push('/dashboard/admin');
            else if (role === 'officer') router.push('/dashboard/officer');
            else router.push('/dashboard/citizen');

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

            <div className="glass-card w-full max-w-md p-8 md:p-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-2 inline-block">
                        CivicConnect
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Make your community better, one step at a time.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mb-6">
                        ⚠️ {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground/80">Password</label>
                                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    >
                        Sign in
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Create free account
                    </Link>
                </p>
            </div>
        </div>
    );
}
