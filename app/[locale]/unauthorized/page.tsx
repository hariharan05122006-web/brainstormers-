import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-100">
            <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600">You are not authorized to view this page.</p>
            <Link href="/">
                <Button variant="outline">Go Home</Button>
            </Link>
        </div>
    );
}
