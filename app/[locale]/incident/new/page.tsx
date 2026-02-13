import { createClient } from "@/utils/supabase/server";
import { IncidentForm } from "@/components/citizen/incident-form";
import { redirect } from "next/navigation";

export default async function NewIncidentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="container py-10">
            <IncidentForm />
        </div>
    );
}
