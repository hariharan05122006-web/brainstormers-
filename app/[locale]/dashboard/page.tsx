import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, PlusCircle, CheckCircle } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button"; // We might need this component

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: complaints, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-black relative text-white selection:bg-red-500/30">
            {/* Background Image with Overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto p-6 md:p-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            My Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Welcome back, Citizen</p>
                    </div>
                    <SignOutButton />
                </header>

                <div className="grid gap-6 md:grid-cols-2 mb-10">
                    {/* Raise Complaint Card */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-400">
                                <PlusCircle className="h-5 w-5" />
                                Raise New Complaint
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 mb-6">
                                Report civic issues like road damage, garbage, or electrical faults.
                            </p>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                                <Link href="/complaint/new">
                                    File Complaint
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Report Accident Card */}
                    <Card className="bg-red-950/20 border-red-900/30 backdrop-blur-md hover:bg-red-900/30 transition-all duration-300 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-500">
                                <AlertTriangle className="h-5 w-5 group-hover:animate-pulse" />
                                Emergency / Accident
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-200/80 mb-6">
                                Instantly report accidents to alert authorities.
                            </p>
                            <Button asChild variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-900/20">
                                <Link href="/incident/new">
                                    Report Accident
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white/90 pl-1 border-l-4 border-blue-500">My History</h2>

                    {!complaints || complaints.length === 0 ? (
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-8 text-center text-gray-400">
                            <p>No complaints filed yet.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {complaints.map((complaint) => (
                                <Card key={complaint.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg text-white mb-1">{complaint.title}</h3>
                                                <p className="text-sm text-gray-400">
                                                    Raised on: {new Date(complaint.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    complaint.status === 'completed' ? 'default' :
                                                        complaint.status === 'rejected' ? 'destructive' : 'secondary'
                                                }
                                                className={
                                                    complaint.status === 'completed' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border-0' :
                                                        complaint.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-0' :
                                                            ''
                                                }
                                            >
                                                {complaint.status}
                                            </Badge>
                                        </div>

                                        {/* Completion Details Section */}
                                        {complaint.status === 'completed' && (
                                            <div className="mt-4 bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Work Completed
                                                </h4>

                                                {complaint.completed_at && (
                                                    <p className="text-xs text-green-200/70 mb-3">
                                                        Resolved on: {new Date(complaint.completed_at).toLocaleString()}
                                                    </p>
                                                )}

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {/* Notes */}
                                                    {complaint.completion_notes && (
                                                        <div className="text-sm text-gray-300">
                                                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Worker Notes:</span>
                                                            "{complaint.completion_notes}"
                                                        </div>
                                                    )}

                                                    {/* After Image */}
                                                    {complaint.after_image_url && (
                                                        <div>
                                                            <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Proof of Work:</span>
                                                            <div className="relative h-40 w-full rounded-md overflow-hidden border border-white/10">
                                                                <div
                                                                    className="absolute inset-0 bg-cover bg-center"
                                                                    style={{ backgroundImage: `url(${complaint.after_image_url})` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
