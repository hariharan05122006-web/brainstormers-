"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("citizen");
    const [departmentId, setDepartmentId] = useState<string>("");
    const [departments, setDepartments] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchDeps() {
            const { data } = await supabase.from('departments').select('*');
            if (data) setDepartments(data);
        }
        fetchDeps();
    }, [supabase]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            const profileUpdates: any = {
                id: authData.user!.id,
                email,
                full_name: fullName,
                role,
            };

            if (role === 'officer' && departmentId) {
                profileUpdates.department_id = parseInt(departmentId);
            }

            const { error: profileError } = await supabase.from('profiles').insert(profileUpdates);
            if (profileError) throw profileError;

            setMessage("Account created! Please check your email.");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse delay-500"></div>

            <div className="glass-card w-full max-w-md p-8 md:p-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-2 inline-block">
                        CivicConnect
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Join us to manage and resolve community complaints.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mb-6">
                        ⚠️ {error}
                    </div>
                )}
                {message && (
                    <div className="rounded-xl bg-green-500/10 p-4 text-sm text-green-600 border border-green-500/20 mb-6">
                        ✅ {message}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            >
                                <option value="citizen">Citizen</option>
                                <option value="officer">Officer</option>
                            </select>
                        </div>

                        {role === 'officer' && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Department</label>
                                <select
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2"
                    >
                        Create Account
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
