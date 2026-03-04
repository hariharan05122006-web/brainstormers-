import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Index' });

    return (
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
            {/* Decorative crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none opacity-[0.04]">
                <div className="absolute top-0 left-1/2 w-px h-full bg-[#d4a853]" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-[#d4a853]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#d4a853]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-[#d4a853]" />
            </div>

            {/* Main content */}
            <div className="relative w-full max-w-lg text-center space-y-10" style={{ animation: 'fade-up 0.6s ease-out both' }}>

                {/* System status */}
                <div className="flex items-center justify-center gap-2 data-readout">
                    <span className="status-dot" />
                    <span className="font-mono text-[11px] tracking-[0.2em] text-[#2dd4a8] uppercase">
                        System Online
                    </span>
                </div>

                {/* Title block */}
                <div className="space-y-4">
                    <h1 className="font-[var(--font-chakra)] text-6xl md:text-7xl font-bold tracking-tight text-[#e8e1d5]"
                        style={{ fontFamily: 'var(--font-chakra)', animation: 'glow-breathe 4s ease-in-out infinite' }}>
                        SCSMS
                    </h1>
                    <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#d4a853] to-transparent" />
                    <p className="font-mono text-[11px] tracking-[0.15em] text-[#6b7280] uppercase">
                        Smart Civic & Safety Management System
                    </p>
                    <p className="text-[#6b7280] text-sm max-w-xs mx-auto leading-relaxed">
                        Tactical operations platform for civic issue reporting and emergency response coordination.
                    </p>
                </div>

                {/* Role selection */}
                <div className="space-y-3 pt-2">
                    <p className="font-mono text-[10px] tracking-[0.25em] text-[#d4a853] uppercase mb-4">
                        Select Access Level
                    </p>

                    <Link href="/login" className="block">
                        <button className="btn-command w-full h-14 text-base rounded cursor-pointer">
                            ◆ Citizen Access
                        </button>
                    </Link>

                    <div className="flex gap-3">
                        <Link href="/worker/login" className="flex-1">
                            <button className="btn-command-ghost w-full h-12 text-sm rounded cursor-pointer">
                                Worker Portal
                            </button>
                        </Link>
                        <Link href="/admin/login" className="flex-1">
                            <button className="btn-command-ghost w-full h-12 text-sm rounded cursor-pointer">
                                Admin Control
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Bottom coordinates */}
                <div className="pt-6 flex justify-center gap-6 font-mono text-[10px] tracking-[0.12em] text-[#6b728060]">
                    <span>VER 2.0.1</span>
                    <span>●</span>
                    <span>SEC-LEVEL: PUBLIC</span>
                    <span>●</span>
                    <span>NODE: ACTIVE</span>
                </div>
            </div>
        </main>
    );
}
