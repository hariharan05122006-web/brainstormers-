import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, AlertTriangle, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch stats
    const { count: workerCount } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    const { count: complaintCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: incidentCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('priority', 'HIGH');

    return (
        <div className="min-h-screen relative z-10">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-[#1e2436] bg-[#0a0c10]/90 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#e84040] shadow-[0_0_8px_#e84040]" style={{ animation: 'blink-status 1.5s ease-in-out infinite' }} />
                            <span className="font-mono text-[10px] tracking-[0.2em] text-[#e84040] uppercase">Admin</span>
                        </div>
                        <div className="h-4 w-px bg-[#1e2436]" />
                        <h1 className="text-xl font-bold tracking-tight text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            Command Center
                        </h1>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.12em] text-[#6b7280] uppercase">
                        System Overview
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-6 md:p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" style={{ animation: 'fade-up 0.5s ease-out both' }}>
                    {/* Total Complaints */}
                    <div className="card-tactical p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#6b7280] uppercase">Total Reports</span>
                            <div className="w-8 h-8 flex items-center justify-center bg-[#d4a853]/10 border border-[#d4a853]/20">
                                <FileText className="h-4 w-4 text-[#d4a853]" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            {complaintCount || 0}
                        </div>
                        <p className="font-mono text-[10px] text-[#6b7280] mt-1 tracking-wider">All time records</p>
                    </div>

                    {/* Active Workers */}
                    <Link href="/admin/workers" className="block">
                        <div className="card-tactical p-5 group cursor-pointer hover:border-[#d4a85360] transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase group-hover:text-[#f0c040] transition-colors">Field Agents</span>
                                <div className="w-8 h-8 flex items-center justify-center bg-[#d4a853]/10 border border-[#d4a853]/20">
                                    <Users className="h-4 w-4 text-[#d4a853]" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                                {workerCount || 0}
                            </div>
                            <div className="flex items-center font-mono text-[10px] text-[#d4a853] mt-1 tracking-wider">
                                Manage <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Pending Issues */}
                    <div className="card-tactical p-5" style={{ borderTopColor: '#f0c040' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#f0c040] uppercase">Pending</span>
                            <div className="w-8 h-8 flex items-center justify-center bg-[#f0c040]/10 border border-[#f0c040]/20">
                                <Clock className="h-4 w-4 text-[#f0c040]" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            {pendingCount || 0}
                        </div>
                        <p className="font-mono text-[10px] text-[#6b7280] mt-1 tracking-wider">Awaiting action</p>
                    </div>

                    {/* Emergency Incidents */}
                    <Link href="/admin/incidents" className="block">
                        <div className="p-5 bg-[#12151c] border border-[#1e2436] border-t-2 border-t-[#e84040] group cursor-pointer hover:border-[#e8404060] transition-all" style={{ animation: 'fade-up 0.5s ease-out 0.2s both' }}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-[10px] tracking-[0.15em] text-[#e84040] uppercase">Emergencies</span>
                                <div className="w-8 h-8 flex items-center justify-center bg-[#e84040]/10 border border-[#e84040]/20">
                                    <AlertTriangle className="h-4 w-4 text-[#e84040] group-hover:animate-pulse" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                                {incidentCount || 0}
                            </div>
                            <div className="flex items-center font-mono text-[10px] text-[#e84040] mt-1 tracking-wider">
                                View All <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Activity Log */}
                <div style={{ animation: 'fade-up 0.5s ease-out 0.25s both' }}>
                    <h2 className="section-header text-lg mb-4">System Activity</h2>
                    <div className="card-tactical p-6">
                        <div className="flex items-center gap-3 text-[#6b7280]">
                            <div className="w-2 h-2 rounded-full bg-[#1e2436]" />
                            <span className="font-mono text-[11px] tracking-[0.1em]">No recent activity logs available</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
