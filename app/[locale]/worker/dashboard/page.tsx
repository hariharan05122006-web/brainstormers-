import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { MapPin, Navigation, CheckCircle, Clock, AlertTriangle, LogOut, Bell } from "lucide-react";
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
        return <div className="p-10 text-red-600 text-center font-bold text-xl">Error: Worker profile not found for {user.email}</div>;
    }

    // Fetch ALL Complaints for this Department to calculate stats
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
        <div className="flex min-h-screen flex-col bg-gray-50/50">
            {/* Premium Header */}
            <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-white/80 px-6 backdrop-blur-xl transition-all">
                <div className="flex flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                        <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Worker Dashboard</h1>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{worker.departments?.name} Department</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-sm font-semibold text-gray-900">{worker.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                    <NotificationBell />
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Tasks</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{pendingTasks}</div>
                            <p className="text-xs text-gray-500 mt-1">Tasks requiring attention</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{completedTasks}</div>
                            <p className="text-xs text-gray-500 mt-1">Total tasks finished</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Efficiency</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">98%</div>
                            <p className="text-xs text-gray-500 mt-1">On-time completion rate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="h-6 w-1 rounded-full bg-blue-600"></span>
                            Assigned Tasks
                        </h2>
                        <Badge variant="outline" className="px-3 py-1 border-gray-300 text-gray-600">
                            {activeTasks.length} Pending
                        </Badge>
                    </div>

                    {activeTasks.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activeTasks.map((task) => (
                                <Card key={task.id} className="group overflow-hidden border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={task.status === 'assigned' ? 'default' : 'secondary'} className={task.status === 'assigned' ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-0" : "bg-gray-100 text-gray-700 border-0"}>
                                                {task.status}
                                            </Badge>
                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                                {new Date(task.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                            {task.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                                            {task.description}
                                        </p>
                                        
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                                <MapPin className="h-4 w-4 text-red-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">Location Coordinates</p>
                                                <p className="text-[10px] text-gray-500 truncate">{task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 gap-3">
                                        <Link href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`} target="_blank" className="flex-1">
                                            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all font-medium">
                                                <Navigation className="h-3.5 w-3.5 mr-2" /> Navigate
                                            </Button>
                                        </Link>
                                        <Link href={`/worker/complaint/${task.id}/complete`} className="flex-1">
                                            <Button className="w-full bg-gray-900 hover:bg-black text-white transition-all shadow-md hover:shadow-lg font-medium">
                                                <CheckCircle className="h-3.5 w-3.5 mr-2" /> Complete
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                            <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Excellent work! You have no pending tasks assigned at the moment. Relax and wait for new assignments.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
