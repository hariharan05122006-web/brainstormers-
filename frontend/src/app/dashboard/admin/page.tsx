"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
    status: string;
    departments?: { name: string };
}

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        } else if (user) {
            // Mock role check
            supabase.from('profiles').select('role').eq('id', user.id).single()
                .then(({ data }) => {
                    // Logic
                });
            fetchData();
        }
    }, [user, isLoading, router, supabase]);

    const fetchData = async () => {
        const { data: complaintsData } = await supabase
            .from("complaints")
            .select("*, profiles(full_name, email), departments(name)")
            .order("created_at", { ascending: false });

        if (complaintsData) {
            setComplaints(complaintsData);

            const total = complaintsData.length;
            const pending = complaintsData.filter(c => c.status === 'Pending').length;
            const resolved = complaintsData.filter(c => c.status === 'Resolved' || c.status === 'Completed').length;

            setStats({ total, pending, resolved });
        }
    };

    const deleteComplaint = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from('complaints').delete().eq('id', id);
        if (!error) {
            setComplaints(prev => prev.filter(c => c.id !== id));
        } else {
            alert("Error deleting: " + error.message);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin text-primary text-2xl">Loading...</div></div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="border-b border-border pb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Admin Overview</h1>
                <p className="text-muted-foreground mt-2">Manage system-wide complaints and view performance metrics.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Complaints" value={stats.total} color="bg-blue-500" icon="📊" />
                <StatCard title="Pending" value={stats.pending} color="bg-yellow-500" icon="⏳" />
                <StatCard title="Resolved" value={stats.resolved} color="bg-green-500" icon="✅" />
            </div>

            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary p-2 rounded-lg">🗂️</span> All Complaints Directory
                </h2>
                <div className="glass-card overflow-hidden shadow-xl rounded-2xl border border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-secondary/50 uppercase text-xs font-bold text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Dept</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {complaints.map(c => (
                                    <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{c.title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{c.departments?.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{c.profiles?.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{c.profiles?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${c.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-200' :
                                                c.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200' : 'bg-blue-500/10 text-blue-600 border-blue-200'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteComplaint(c.id)}
                                                className="text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs border border-transparent hover:border-destructive/20"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {complaints.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No complaints found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatCard({ title, value, color, icon }: { title: string, value: number, color: string, icon: string }) {
    return (
        <div className="glass-card p-6 flex items-center justify-between hover:-translate-y-1 transition-transform cursor-default">
            <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
                <p className="text-4xl font-extrabold text-foreground mt-2">{value}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center text-3xl shadow-sm`}>
                {icon}
            </div>
        </div>
    )
}

function ComplaintChart({ data }: { data: ChartData[] }) {
    // Process data for chart
    const chartData = [
        { name: 'Pending', count: data.filter((c: ChartData) => c.status === 'Pending').length },
        { name: 'Assigned', count: data.filter((c: ChartData) => c.status === 'Assigned').length },
        { name: 'In Progress', count: data.filter((c: ChartData) => c.status === 'In Progress').length },
        { name: 'Resolved', count: data.filter((c: ChartData) => c.status === 'Resolved').length },
    ];

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6">Complaint Status Distribution</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function DepartmentChart({ data }: { data: ChartData[] }) {
    // Group by department
    const deptCounts: Record<string, number> = {};
    data.forEach((c: ChartData) => {
        const dept = c.departments?.name || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const chartData = Object.keys(deptCounts).map(dept => ({ name: dept, value: deptCounts[dept] }));
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6">Complaints by Department</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name} ({entry.value})</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
