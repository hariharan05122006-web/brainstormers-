import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, AlertTriangle, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch stats
    const { count: workerCount } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    const { count: complaintCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
    // Fix: pendingCount query was selecting all columns instead of just count
    const { count: pendingCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: incidentCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('priority', 'HIGH');

    return (
        <div className="min-h-screen bg-black relative text-white selection:bg-red-500/30">
            {/* Background Image with Overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600')", // Different city/admin vibe
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto p-6 md:p-8 space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                            Admin Dashboard
                        </h2>
                        <p className="text-gray-400 mt-1">System Overview & Management</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Complaints */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Total Complaints</CardTitle>
                            <FileText className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{complaintCount || 0}</div>
                            <p className="text-xs text-gray-400 mt-1">All time reports</p>
                        </CardContent>
                    </Card>

                    {/* Active Workers */}
                    <Link href="/admin/workers">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors">Active Workers</CardTitle>
                                <Users className="h-4 w-4 text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{workerCount || 0}</div>
                                <div className="flex items-center text-xs text-orange-400 mt-1">
                                    Manage Workers <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Pending Issues */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Pending Issues</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{pendingCount || 0}</div>
                            <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
                        </CardContent>
                    </Card>

                    {/* Emergency Incidents */}
                    <Link href="/admin/incidents">
                        <Card className="bg-red-950/20 border-red-900/40 backdrop-blur-md hover:bg-red-900/30 transition-all duration-300 cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-400">Emergency Incidents</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500 group-hover:animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{incidentCount || 0}</div>
                                <div className="flex items-center text-xs text-red-400 mt-1">
                                    View Emergencies <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400 text-sm">No recent activity logs available.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
