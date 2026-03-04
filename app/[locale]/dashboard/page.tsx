import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, PlusCircle, CheckCircle } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

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
        <div className="min-h-screen relative z-10">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-[#1e2436] bg-[#0a0c10]/90 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2dd4a8] shadow-[0_0_8px_#2dd4a8]" style={{ animation: 'blink-status 2s ease-in-out infinite' }} />
                            <span className="font-mono text-[10px] tracking-[0.2em] text-[#6b7280] uppercase">Online</span>
                        </div>
                        <div className="h-4 w-px bg-[#1e2436]" />
                        <h1 className="text-xl font-bold tracking-tight text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                            Citizen Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block font-mono text-[10px] tracking-[0.12em] text-[#6b7280] uppercase">
                            {user.email}
                        </span>
                        <SignOutButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6 md:p-8 space-y-8">
                {/* Action Cards */}
                <div className="grid gap-4 md:grid-cols-2" style={{ animation: 'fade-up 0.5s ease-out both' }}>
                    {/* Raise Complaint Card */}
                    <div className="card-tactical p-6 group hover:border-[#d4a85380] transition-all duration-300 cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#d4a853]/10 border border-[#d4a853]/30">
                                    <PlusCircle className="h-5 w-5 text-[#d4a853]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e8e1d5] tracking-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                                        Raise New Complaint
                                    </h3>
                                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#6b7280] uppercase">New Mission</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-[#6b7280] mb-5 leading-relaxed">
                            Report civic issues like road damage, garbage, or electrical faults.
                        </p>
                        <Link href="/complaint/new">
                            <button className="btn-command w-full h-11 text-sm rounded-none cursor-pointer">
                                File Complaint
                            </button>
                        </Link>
                    </div>

                    {/* Report Accident Card */}
                    <div className="p-6 bg-[#12151c] border border-[#1e2436] border-t-2 border-t-[#e84040] group hover:border-[#e8404080] transition-all duration-300 cursor-pointer" style={{ animation: 'fade-up 0.5s ease-out 0.1s both' }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#e84040]/10 border border-[#e84040]/30">
                                    <AlertTriangle className="h-5 w-5 text-[#e84040] group-hover:animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e8e1d5] tracking-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                                        Emergency / Accident
                                    </h3>
                                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#e84040] uppercase flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#e84040] shadow-[0_0_6px_#e84040]" style={{ animation: 'blink-status 1s ease-in-out infinite' }} />
                                        Priority Alert
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-[#6b7280] mb-5 leading-relaxed">
                            Instantly report accidents to alert nearby authorities.
                        </p>
                        <Link href="/incident/new">
                            <button className="btn-command-danger w-full h-11 text-sm rounded-none cursor-pointer">
                                Report Accident
                            </button>
                        </Link>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-4" style={{ animation: 'fade-up 0.5s ease-out 0.2s both' }}>
                    <h2 className="section-header text-lg">Mission Log</h2>

                    {!complaints || complaints.length === 0 ? (
                        <div className="card-tactical p-10 text-center">
                            <div className="font-mono text-[11px] tracking-[0.12em] text-[#6b7280] uppercase">
                                No complaints filed yet
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {complaints.map((complaint, index) => (
                                <div
                                    key={complaint.id}
                                    className="card-tactical p-5 hover:border-[#d4a85340] transition-all duration-300"
                                    style={{ animationDelay: `${0.05 * index}s` }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-base text-[#e8e1d5]" style={{ fontFamily: 'var(--font-chakra)' }}>
                                                {complaint.title}
                                            </h3>
                                            <p className="font-mono text-[10px] tracking-[0.12em] text-[#6b7280] mt-0.5">
                                                {new Date(complaint.created_at).toLocaleDateString()} • {new Date(complaint.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span className={`font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1 border ${complaint.status === 'completed'
                                                ? 'text-[#2dd4a8] border-[#2dd4a8]/30 bg-[#2dd4a8]/10'
                                                : complaint.status === 'pending'
                                                    ? 'text-[#d4a853] border-[#d4a853]/30 bg-[#d4a853]/10'
                                                    : complaint.status === 'rejected'
                                                        ? 'text-[#e84040] border-[#e84040]/30 bg-[#e84040]/10'
                                                        : 'text-[#6b7280] border-[#1e2436] bg-[#1e2436]'
                                            }`}>
                                            {complaint.status}
                                        </span>
                                    </div>

                                    {/* Completion Details */}
                                    {complaint.status === 'completed' && (
                                        <div className="mt-4 p-4 bg-[#2dd4a8]/5 border border-[#2dd4a8]/20">
                                            <h4 className="font-mono text-[10px] tracking-[0.15em] text-[#2dd4a8] uppercase mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Work Completed
                                            </h4>

                                            {complaint.completed_at && (
                                                <p className="font-mono text-[10px] text-[#6b7280] mb-3">
                                                    Resolved: {new Date(complaint.completed_at).toLocaleString()}
                                                </p>
                                            )}

                                            <div className="grid gap-4 md:grid-cols-2">
                                                {complaint.completion_notes && (
                                                    <div className="text-sm text-[#e8e1d5]/80">
                                                        <span className="font-mono text-[10px] tracking-[0.12em] text-[#6b7280] uppercase block mb-1">Worker Notes:</span>
                                                        &ldquo;{complaint.completion_notes}&rdquo;
                                                    </div>
                                                )}

                                                {complaint.after_image_url && (
                                                    <div>
                                                        <span className="font-mono text-[10px] tracking-[0.12em] text-[#6b7280] uppercase block mb-1">Proof of Work:</span>
                                                        <div className="relative h-40 w-full overflow-hidden border border-[#1e2436]">
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
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
