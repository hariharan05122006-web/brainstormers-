import { createBrowserClient } from '@supabase/ssr'

const MOCK_URL = "https://placeholder.supabase.co"
const MOCK_KEY = "placeholder"

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validation: Check if values are default/missing
    if (!url || !key || url.includes("your_supabase_url")) {
        console.warn("Supabase credentials missing! Using Mock Client.")
        return createMockClient()
    }

    try {
        return createBrowserClient(url, key)
    } catch (e) {
        console.error("Invalid Supabase URL/Key", e)
        return createMockClient()
    }
}

function createMockClient() {
    return {
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: { role: 'citizen' }, error: null }),
                    order: () => Promise.resolve({ data: [], error: null })
                }),
                order: () => Promise.resolve({ data: [], error: null }),
                then: (cb: any) => cb({ data: [], error: null }) // simple promise-like
            }),
            insert: () => Promise.resolve({ error: null }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) })
        }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-id', email: 'mock@example.com' } }, error: null }),
            signUp: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
            signOut: () => Promise.resolve()
        }
    } as any
}
