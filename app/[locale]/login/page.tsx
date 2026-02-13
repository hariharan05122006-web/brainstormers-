import { CitizenLoginForm } from "@/components/auth/citizen-login-form"

export default function CitizenLoginPage() {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')"
            }}
        >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full max-w-md">
                <CitizenLoginForm />
            </div>
        </div>
    )
}
