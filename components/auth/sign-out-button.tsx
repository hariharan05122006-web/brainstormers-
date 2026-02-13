'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10 gap-2"
            onClick={handleSignOut}
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </Button>
    )
}
