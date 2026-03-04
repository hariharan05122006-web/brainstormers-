import { CitizenLoginForm } from "@/components/auth/citizen-login-form"

export default function CitizenLoginPage() {
    return (
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            {/* Decorative grid lines */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
                <div className="absolute top-0 left-1/4 w-px h-full bg-[#d4a853]" />
                <div className="absolute top-0 left-2/4 w-px h-full bg-[#d4a853]" />
                <div className="absolute top-0 left-3/4 w-px h-full bg-[#d4a853]" />
                <div className="absolute top-1/3 left-0 w-full h-px bg-[#d4a853]" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-[#d4a853]" />
            </div>
            <div className="relative z-10 w-full max-w-md" style={{ animation: 'fade-up 0.5s ease-out both' }}>
                <CitizenLoginForm />
            </div>
        </div>
    )
}
