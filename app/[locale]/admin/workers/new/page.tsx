import { createClient } from "@/utils/supabase/server";
import { AddWorkerForm } from "@/components/admin/add-worker-form";
import { redirect } from "next/navigation";

export default async function AddWorkerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const { data: departments } = await supabase.from('departments').select('*');

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

            <div className="relative z-10 container mx-auto p-6 md:p-8 flex justify-center items-center min-h-[80vh]">
                <AddWorkerForm departments={departments || []} />
            </div>
        </div>
    );
}
