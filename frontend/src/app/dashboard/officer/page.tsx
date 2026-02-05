"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function OfficerDashboard() {
    const { user, isLoading } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [officerProfile, setOfficerProfile] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        async function init() {
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setOfficerProfile(profile);
                    if (profile.role !== 'officer') {
                        // Mock override for demo
                        // router.push('/');
                    }
                    fetchComplaints(profile.department_id);
                }
            }
        }
        init();
    }, [user, router, supabase]);

    const fetchComplaints = async (deptId: number) => {
        if (!deptId) return;
        const { data } = await supabase
            .from("complaints")
            .select("*, profiles(full_name, email)")
            .eq("department_id", deptId)
            .order("created_at", { ascending: false });

        if (data) setComplaints(data);
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (err: any) {
            alert("Update failed: " + err.message);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin text-primary text-2xl">Loading...</div></div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Officer Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">Department ID: {officerProfile?.department_id}</span>
                    </div>
                </div>
            </header>

            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-2 rounded-lg">📋</span> Assigned Complaints
                </h2>
                {complaints.length === 0 ? (
                    <div className="glass-card p-12 text-center text-muted-foreground border-dashed border-2">
                        <p>No complaints found for your department. Good job keeping things clean!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {complaints.map((c) => (
                            <div key={c.id} className="glass-card p-6 border-l-4 border-l-primary flex flex-col lg:flex-row justify-between gap-6 hover:shadow-lg transition-shadow">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-xl text-foreground">{c.title}</h3>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">#{c.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{c.profiles?.full_name || 'Anonymous'}</span>
                                        <span>•</span>
                                        <span>{c.profiles?.email}</span>
                                        <span>•</span>
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-foreground/80 leading-relaxed bg-background/50 p-4 rounded-lg border border-border/50">
                                        {c.description}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[200px] justify-center bg-secondary/20 p-4 rounded-xl">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Update Status</label>
                                    <div className="relative">
                                        <select
                                            value={c.status}
                                            onChange={(e) => updateStatus(c.id, e.target.value)}
                                            className="w-full appearance-none bg-background border border-input text-foreground rounded-lg py-2.5 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium shadow-sm transition-all cursor-pointer hover:border-primary/50"
                                        >
                                            <option value="Pending">🟡 Pending</option>
                                            <option value="Assigned">🔵 Assigned</option>
                                            <option value="In Progress">🟣 In Progress</option>
                                            <option value="Completed">🟢 Completed</option>
                                            <option value="Rejected">🔴 Rejected</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
