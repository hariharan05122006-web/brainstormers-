'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkerAction(formData: FormData) {
    const name = formData.get('name') as string
    const workerId = formData.get('workerId') as string
    const password = formData.get('password') as string
    const departmentId = formData.get('departmentId') as string

    if (!name || !workerId || !password || !departmentId) {
        return { error: 'All fields are required' }
    }

    // 1. Verify Admin Session
    const supabaseUser = await createServerClient()
    const { data: { user } } = await supabaseUser.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check whitelist in DB
    const { data: adminUser } = await supabaseUser
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single()

    if (!adminUser) {
        return { error: 'Unauthorized: Not an Admin' }
    }

    // 2. Initialize Service Role Client (for creating Auth User)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: 'Server misconfiguration: Missing Service Role Key' }
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 3. Create Auth User
    // The form field "workerId" seems to be used for Email in the screenshot (joy123@gmail.com).
    // Let's treat 'workerId' input as the EMAIL if it looks like one, or use it as an ID.
    // The prompt says "Worker ID" but user typed "joy123@gmail.com".
    // Let's check if workerId is an email.

    let email = workerId
    if (!email.includes('@')) {
        email = `worker_${workerId}@scsms.local` // Fallback for plain IDs
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'worker', name, worker_id: workerId }
    })

    if (authError) {
        return { error: `Auth Error: ${authError.message}` }
    }

    if (!authData.user) {
        return { error: 'Failed to create auth user' }
    }

    // 4. Insert into 'workers' table
    // We use the supabaseAdmin client to bypass RLS if needed, or just standard client since Admin has RLS rights?
    // Admin RLS policy: "Admins can view..." -> Do we have "Admins can insert"?
    // schema.sql: "workers enable row level security". No insert policy defined for workers.
    // So standard client INSERT will fail.
    // We MUST use service role or add policy.
    // Using service role is easier here.

    const { error: dbError } = await supabaseAdmin
        .from('workers')
        .insert({
            id: authData.user.id, // Link ID directly? Or let UUID gen and store user_id?
            // Schema: id (uuid pk), department_id, name, worker_id, password_hash
            // We added 'email'.
            // If we want to link Auth, better to set 'id' = authData.user.id
            // But 'id' in schema is default uuid_generate_v4().
            // Let's use auth.uid as PK? 
            // Schema says: id uuid primary key default uuid_generate_v4().
            // If we insert 'id', it overrides default. This is good practice for 1:1 mapping.
            // So Worker ID in DB = Auth User ID.
            department_id: departmentId,
            name,
            worker_id: workerId,
            email: email, // Store the generated email
            password_hash: 'managed_by_supabase_auth' // Placeholder or we don't store it.
        })

    if (dbError) {
        // Rollback auth user?
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: `DB Error: ${dbError.message}` }
    }

    revalidatePath('/admin/workers')
    return { success: true, message: `Worker created! Login: ${email}` }
}
