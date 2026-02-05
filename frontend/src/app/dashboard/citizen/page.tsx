"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function CitizenDashboard() {
    const { user, isLoading } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deptId, setDeptId] = useState("");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login"); // Mock Check if mock default is set
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            fetchComplaints();
            fetchDepartments();
        }
    }, [user]);

    const fetchComplaints = async () => {
        if (!user) return;
        const { data } = await supabase
            .from("complaints")
            .select("*, departments(name)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setComplaints(data);
    };

    const fetchDepartments = async () => {
        const { data } = await supabase.from("departments").select("*");
        if (data) setDepartments(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("complaints").insert({
                user_id: user.id,
                title,
                description,
                department_id: parseInt(deptId),
                status: "Pending"
            });

            if (error) throw error;

            setTitle("");
            setDescription("");
            setDeptId("");
            fetchComplaints();
            alert("Complaint submitted successfully!");
        } catch (err: any) {
            alert("Error submitting: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin text-primary text-2xl">Loading...</div></div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Citizen Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, <span className="font-semibold text-primary">{user?.email}</span></p>
                </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* New Complaint Form */}
                <section className="lg:col-span-5">
                    <div className="glass-card p-6 sticky top-24">
                        <h2 className="mb-6 text-xl font-bold flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg">📝</span> File a Complaint
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g. Broken Streetlight"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Department</label>
                                <select
                                    required
                                    value={deptId}
                                    onChange={(e) => setDeptId(e.target.value)}
                                    className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border-input bg-background/50 p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md flex justify-center items-center"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Complaint"}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Complaints History */}
                <section className="lg:col-span-7 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-secondary text-secondary-foreground p-2 rounded-lg">🗂️</span> My Complaints
                    </h2>
                    {complaints.length === 0 ? (
                        <div className="glass-card p-12 text-center text-muted-foreground border-dashed border-2">
                            <p>No complaints yet. Help improve your city by filing one!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((c) => (
                                <div key={c.id} className="glass-card p-5 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{c.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span className="px-2 py-0.5 rounded-full bg-secondary/50 font-medium">
                                                    {c.departments?.name || "Unknown Dept"}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                        {c.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Resolved: "bg-green-500/10 text-green-600 border-green-200",
        Completed: "bg-green-500/10 text-green-600 border-green-200",
        Pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        Assigned: "bg-blue-500/10 text-blue-600 border-blue-200",
        Rejected: "bg-red-500/10 text-red-600 border-red-200",
    };

    const defaultStyle = "bg-gray-100 text-gray-600 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || defaultStyle}`}>
            {status}
        </span>
    );
}
