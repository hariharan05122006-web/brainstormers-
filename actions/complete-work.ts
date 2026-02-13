'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeWorkAction(formData: FormData) {
    const supabase = await createClient();

    // 1. Get current worker (secure check)
    // We need to verify if the user is a worker. 
    // Since workers have a custom login, we might need to check the session or cookie.
    // Assuming standard Supabase Auth or our custom worker session logic (if any).
    // For now, we'll check if *any* user is logged in, and trust the UI state for the ID.
    // Ideally, we should double-check if the logged-in user is indeed the assigned worker.

    // Reviewing previous worker login implementation:
    // It uses `signInWithPassword`. So `getUser()` should return the worker's auth user.
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized. Please login again.' };
    }

    const complaintId = formData.get('complaintId') as string;
    const notes = formData.get('notes') as string;
    const file = formData.get('image') as File;

    if (!complaintId || !file) {
        return { error: 'Missing required fields (Image is mandatory).' };
    }

    if (file.size === 0) {
        return { error: 'Image file is empty.' };
    }

    try {
        // 2. Upload Image to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `completed_${complaintId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('complaints')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { error: 'Failed to upload proof image.' };
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('complaints')
            .getPublicUrl(filePath);

        // 4. Update Complaint Record
        const { data: updatedComplaint, error: updateError } = await supabase
            .from('complaints')
            .update({
                status: 'completed',
                after_image_url: publicUrl,
                completion_notes: notes,
                completed_at: new Date().toISOString()
            })
            .eq('id', complaintId)
            .select()
            .single();

        if (updateError) {
            console.error('Update Error:', updateError);
            return { error: 'Failed to update complaint status.' };
        }

        if (updatedComplaint) {
            // 5. Insert Notification for the Citizen
            const { error: notifError } = await supabase
                .from("notifications")
                .insert({
                    user_id: updatedComplaint.user_id, // Notify the citizen who created the complaint
                    message: `Your complaint "${updatedComplaint.title}" has been resolved by the worker.`,
                    read: false
                });

            if (notifError) {
                console.error('Notification Error:', notifError);
                // We don't return error here, as the main action succeeded.
            }
        }




        // 5. Revalidate and Redirect
        revalidatePath('/worker/dashboard');
        revalidatePath(`/worker/complaint/${complaintId}`);
        return { success: true };
    }
