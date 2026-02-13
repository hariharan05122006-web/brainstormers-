import { createClient } from "@/utils/supabase/server";
import { ComplaintForm } from "@/components/citizen/complaint-form";
import { redirect } from "next/navigation";

export default async function NewComplaintPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: departments } = await supabase
        .from("departments")
        .select("id, name");

    return (
        <div className="container py-10">
            <ComplaintForm departments={departments || []} />
        </div>
    );
}
