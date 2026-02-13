import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export default async function AdminWorkersPage() {
    const supabase = await createClient();

    const { data: workers } = await supabase
        .from("workers")
        .select("*, departments(name)")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-black relative text-white selection:bg-red-500/30">
            {/* Background Image with Overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto p-6 md:p-8 space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                            Manage Workers
                        </h1>
                        <p className="text-gray-400 mt-1">View and manage your workforce.</p>
                    </div>
                    <Link href="/admin/workers/new">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0">
                            <Plus className="mr-2 h-4 w-4" /> Add Worker
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-white/10">
                                <TableHead className="text-gray-300">Worker ID</TableHead>
                                <TableHead className="text-gray-300">Name</TableHead>
                                <TableHead className="text-gray-300">Department</TableHead>
                                <TableHead className="text-gray-300">Email</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workers && workers.map((worker) => (
                                <TableRow key={worker.id} className="border-white/10 hover:bg-white/10 transition-colors">
                                    <TableCell className="font-medium text-white">{worker.worker_id}</TableCell>
                                    <TableCell className="text-gray-300">{worker.name}</TableCell>
                                    <TableCell className="text-gray-300">{worker.departments?.name}</TableCell>
                                    <TableCell className="text-gray-300">{worker.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={worker.status === 'active'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }
                                        >
                                            {worker.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
