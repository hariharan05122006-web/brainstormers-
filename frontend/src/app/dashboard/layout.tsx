import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 ml-64 bg-background dark:bg-black/50 transition-all">
                {children}
            </main>
        </div>
    );
}
