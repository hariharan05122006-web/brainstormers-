import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="relative z-10 flex h-screen flex-col items-center justify-center gap-6 text-center px-6">
            {/* Warning icon */}
            <div className="w-16 h-16 flex items-center justify-center bg-[#e84040]/10 border border-[#e84040]/30">
                <span className="text-3xl">⚠</span>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#e84040] tracking-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                    Access Denied
                </h1>
                <p className="font-mono text-[11px] tracking-[0.12em] text-[#6b7280] uppercase">
                    Authorization level insufficient
                </p>
            </div>

            <p className="text-sm text-[#6b7280] max-w-md">
                You are not authorized to view this page. Contact your system administrator for access.
            </p>

            <Link href="/">
                <button className="btn-command-ghost h-10 px-8 text-sm rounded-none cursor-pointer">
                    Return to Base
                </button>
            </Link>
        </div>
    );
}
