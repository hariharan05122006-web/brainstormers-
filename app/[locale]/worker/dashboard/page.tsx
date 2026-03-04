import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { MapPin, Navigation, CheckCircle, Clock, AlertTriangle, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function WorkerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/worker/login");
    }

    // Fetch Worker Details
    const { data: worker } = await supabase
        .from("workers")
        .select("*, departments(name)")
        .eq("email", user.email)
        .single();

    if (!worker) {
        return (
            <div className="min-h-screen relative z-10 flex items-center justify-center">
                <div className="card-tactical p-8 text-center">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-[#e84040] uppercase">⚠ Error:</span>
                    <p className="text-[#e8e1d5] mt-2">Worker profile not found for {user.email}</p>
                </div>
            </div>
        );
    }

    // Fetch ALL Complaints for this Department
    const { data: allTasks } = await supabase
        .from("complaints")
        .select("*")
        .eq("department_id", worker.department_id)
        .order("created_at", { ascending: false });

    // Filter tasks
    const activeTasks = allTasks?.filter(t => t.status !== 'completed' && t.status !== 'rejected') || [];
    const completedTasks = allTasks?.filter(t => t.status === 'completed').length || 0;
    const pendingTasks = activeTasks.length;

    return (
        <div className="min-h-screen relative z-10">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-[#1e2436] bg-[#0a0c10]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center bg-[#d4a853]/10 border border-[#d4a853]/30">
                            <MapPin className="h-4 w-4 text-[#d4a853]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                                Field Operations
                            </h1>
                            <p className="font-mono text-[10px] tracking-[0.15em] text-[#6b7280] uppercase">
                                {worker.departments?.name} Dept
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-[#e8e1d5]">{worker.name}</span>
                            <span className="font-mono text-[10px] text-[#6b7280]">{user.email}</span>
                        </div>
                        <NotificationBell />
                        <form action="/auth/signout" method="post">
                            <button className="w-9 h-9 flex items-center justify-center text-[#6b7280] hover:text-[#e84040] hover:bg-[#e84040]/10 transition-all cursor-pointer border border-transparent hover:border-[#e84040]/30">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                {/* Stats HUD */}
                <div className="grid gap-4 md:grid-cols-3" style={{ animation: 'fade-up 0.5s ease-out both' }}>
                    {/* Active Tasks */}
                    <div className="card-tactical p-5 glow-border">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Active Ops</span>
                            <div className="w-8 h-8 flex items-center justify-center bg-[#d4a853]/10 border border-[#d4a853]/20">
                                <AlertTriangle className="h-4 w-4 text-[#d4a853]" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            {pendingTasks}
                        </div>
                        <p className="font-mono text-[10px] text-[#6b7280] mt-1 tracking-wider">Tasks requiring action</p>
                    </div>

                    {/* Completed */}
                    <div className="card-tactical p-5" style={{ borderTopColor: '#2dd4a8' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#2dd4a8] uppercase">Completed</span>
                            <div className="w-8 h-8 flex items-center justify-center bg-[#2dd4a8]/10 border border-[#2dd4a8]/20">
                                <CheckCircle className="h-4 w-4 text-[#2dd4a8]" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            {completedTasks}
                        </div>
                        <p className="font-mono text-[10px] text-[#6b7280] mt-1 tracking-wider">Total resolved</p>
                    </div>

                    {/* Efficiency */}
                    <div className="card-tactical p-5" style={{ borderTopColor: '#6b7280' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#6b7280] uppercase">Efficiency</span>
                            <div className="w-8 h-8 flex items-center justify-center bg-[#6b7280]/10 border border-[#6b7280]/20">
                                <Clock className="h-4 w-4 text-[#6b7280]" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            98<span className="text-lg text-[#6b7280]">%</span>
                        </div>
                        <p className="font-mono text-[10px] text-[#6b7280] mt-1 tracking-wider">On-time rate</p>
                    </div>
                </div>

                {/* Tasks Section */}
                <div style={{ animation: 'fade-up 0.5s ease-out 0.15s both' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-header text-lg">Assigned Tasks</h2>
                        <span className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase px-3 py-1 border border-[#d4a853]/30 bg-[#d4a853]/5">
                            {activeTasks.length} Pending
                        </span>
                    </div>

                    {activeTasks.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeTasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className="card-tactical group overflow-hidden hover:border-[#d4a85360] transition-all duration-300"
                                    style={{ animationDelay: `${0.05 * index}s` }}
                                >
                                    {/* Hover accent bar */}
                                    <div className="h-0.5 w-full bg-gradient-to-r from-[#d4a853] to-[#f0c040] opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="p-5">
                                        {/* Status & Date */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border ${task.status === 'assigned'
                                                    ? 'text-[#d4a853] border-[#d4a853]/30 bg-[#d4a853]/10'
                                                    : 'text-[#6b7280] border-[#1e2436] bg-[#1e2436]'
                                                }`}>
                                                {task.status}
                                            </span>
                                            <span className="font-mono text-[10px] text-[#6b728060]">
                                                {new Date(task.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base font-bold text-[#e8e1d5] mb-2 group-hover:text-[#d4a853] transition-colors leading-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                                            {task.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-[#6b7280] line-clamp-2 mb-4 leading-relaxed">
                                            {task.description}
                                        </p>

                                        {/* Location */}
                                        <div className="flex items-center gap-3 p-3 bg-[#0a0c10] border border-[#1e2436] mb-4">
                                            <div className="w-8 h-8 flex items-center justify-center bg-[#e84040]/10 border border-[#e84040]/20 flex-shrink-0">
                                                <MapPin className="h-3.5 w-3.5 text-[#e84040]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-[10px] tracking-[0.1em] text-[#e8e1d5] uppercase">Coordinates</p>
                                                <p className="font-mono text-[10px] text-[#6b7280] truncate">
                                                    {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`} target="_blank" className="flex-1">
                                                <button className="btn-command-ghost w-full h-9 text-[11px] rounded-none cursor-pointer flex items-center justify-center gap-1.5">
                                                    <Navigation className="h-3 w-3" /> Navigate
                                                </button>
                                            </Link>
                                            <Link href={`/worker/complaint/${task.id}/complete`} className="flex-1">
                                                <button className="btn-command w-full h-9 text-[11px] rounded-none cursor-pointer flex items-center justify-center gap-1.5">
                                                    <CheckCircle className="h-3 w-3" /> Complete
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card-tactical flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 flex items-center justify-center bg-[#2dd4a8]/10 border border-[#2dd4a8]/20 mb-4">
                                <CheckCircle className="h-8 w-8 text-[#2dd4a8]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#e8e1d5] mb-1" style={{ fontFamily: 'var(--font-chakra)' }}>
                                All Clear
                            </h3>
                            <p className="text-sm text-[#6b7280] max-w-sm">
                                No pending tasks assigned. Stand by for new assignments.
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4a8] shadow-[0_0_6px_#2dd4a8]" style={{ animation: 'blink-status 2s ease-in-out infinite' }} />
                                <span className="font-mono text-[10px] tracking-[0.15em] text-[#2dd4a8] uppercase">Standby Mode</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
