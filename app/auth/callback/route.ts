import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'email' | 'magiclink' | 'signup' | null
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    const supabase = await createClient()
    let error = null

    if (code) {
        // PKCE flow
        const result = await supabase.auth.exchangeCodeForSession(code)
        error = result.error
    } else if (token_hash && type) {
        // Implicit / magic link flow
        const result = await supabase.auth.verifyOtp({ token_hash, type })
        error = result.error
    }

    if (!error && (code || token_hash)) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    if (error) {
        console.error('Auth Callback Error:', error)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

