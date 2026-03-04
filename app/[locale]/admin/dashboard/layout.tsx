import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/admin/login");
    }

    // Check Whitelist
    const { data: adminUser, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", user.email)
        .single();

    const isHardcodedAdmin = user.email === "galikeerthi2006@gmail.com";

    if ((error || !adminUser) && !isHardcodedAdmin) {
        console.error("Access Denied: User not in whitelist", user.email);
        return redirect("/unauthorized");
    }

    // Layout is minimal — the dashboard page renders its own tactical header
    return <>{children}</>;
}
