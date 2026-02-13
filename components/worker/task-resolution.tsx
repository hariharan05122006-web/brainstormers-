'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, Upload } from "lucide-react"

interface TaskResolutionProps {
    taskId: string
    existingStatus: string
}

export function TaskResolution({ taskId, existingStatus }: TaskResolutionProps) {
    const [status, setStatus] = useState(existingStatus)
    const [notes, setNotes] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleComplete = async () => {
        setLoading(true)
        setError('')

        try {
            if (!file) {
                throw new Error('Completion proof (photo) is required.')
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const fileExt = file.name.split('.').pop()
            const fileName = `resolution_${taskId}_${Date.now()}.${fileExt}`
            const filePath = `resolutions/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('complaints')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('complaints')
                .getPublicUrl(filePath)

            // We could store resolution image separately or update the complaint record.
            // Schema doesn't have resolution_image_url.
            // We can append to description or assume there's a field.
            // Or create an audit log.
            // For simplicity, let's update status and description with note.
            // Wait, schema has `updated_at`.
            // Let's create a new column `resolution_image_url`?
            // Or just store it in `image_url` (overwriting? No).
            // Best: Add `resolution_image_url` to schema.
            // I will assume for now we append link to description for MVP.

            const finalDescription = `[RESOLVED: ${publicUrlData.publicUrl}] ${notes}`

            const { error: updateError } = await supabase
                .from('complaints')
                .update({
                    status: 'completed',
                    description: finalDescription, // Hack for now
                    updated_at: new Date().toISOString()
                })
                .eq('id', taskId)

            if (updateError) throw updateError

            setStatus('completed')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (status === 'completed') {
        return (
            <Alert className="bg-green-50 border-green-200 mt-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                    This task has been marked as completed.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card className="mt-6 border-blue-200">
            <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">Resolve Task</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="notes">Completion Notes</Label>
                    <Textarea
                        id="notes"
                        placeholder="Describe work done..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="proof">Upload Proof (Required)</Label>
                    <Input
                        id="proof"
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                </div>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Mark as Completed
                </Button>
            </CardContent>
        </Card>
    )
}
