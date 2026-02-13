import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";

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

    if (error || !adminUser) {
        console.error("Access Denied: User not in whitelist", user.email);
        return redirect("/unauthorized");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-white p-4 shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <NotificationBell />
            </header>
            <main className="flex-1 p-6 bg-slate-50">{children}</main>
        </div>
    );
}
