'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Upload } from "lucide-react"

interface Department {
    id: string
    name: string
}

export function ComplaintForm({ departments }: { departments: Department[] }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const getLocation = () => {
        setLocationLoading(true)
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setLocationLoading(false)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                })
                setLocationLoading(false)
            },
            (err) => {
                setError('Unable to retrieve your location')
                setLocationLoading(false)
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!location) {
            setError('Location is mandatory. Please enable GPS.')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            let imageUrl = null

            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('complaints')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('complaints')
                    .getPublicUrl(filePath)

                imageUrl = publicUrlData.publicUrl
            }

            const { error: insertError } = await supabase
                .from('complaints')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    department_id: departmentId,
                    latitude: location.lat,
                    longitude: location.long,
                    image_url: imageUrl,
                    status: 'pending'
                })

            if (insertError) throw insertError

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Raise a Complaint</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Broken Street Light"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dept">Department</Label>
                        <Select onValueChange={setDepartmentId} value={departmentId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea
                            id="desc"
                            placeholder="Describe the issue in detail..."
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Location (Mandatory)</Label>
                        <div className="flex gap-2 items-center">
                            <Button type="button" variant="outline" onClick={getLocation} disabled={locationLoading}>
                                {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                {location ? 'Location Captured' : 'Get Current Location'}
                            </Button>
                            {location && <span className="text-xs text-green-600">Lat: {location.lat.toFixed(4)}, Long: {location.long.toFixed(4)}</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Photo Evidence</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
