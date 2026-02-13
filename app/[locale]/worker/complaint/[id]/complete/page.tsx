import { createClient } from "@/utils/supabase/server";
import { CompleteWorkForm } from "@/components/worker/complete-work-form";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function WorkerCompletePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/worker/login');
    }

    // Fetch Complaint Details
    const { data: complaint, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !complaint) {
        return <div className="text-white p-6">Complaint not found.</div>;
    }

    return (
        <div className="min-h-screen bg-black relative text-white">
            {/* Background Image with Overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600')", // Construction/Work theme
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto p-4 flex flex-col items-center justify-center min-h-screen py-10">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Complete Task</h1>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">{complaint.title}</p>
                </div>

                {/* Before Image Preview (Small) */}
                {complaint.image_url && (
                    <div className="mb-6 w-full max-w-md bg-white/5 rounded-lg p-2 border border-white/10">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Original Issue:</p>
                        <div className="relative w-full h-32 rounded overflow-hidden">
                            <Image
                                src={complaint.image_url}
                                alt="Before"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                <CompleteWorkForm complaintId={complaint.id} />
            </div>
        </div>
    );
}
