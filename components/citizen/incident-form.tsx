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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, AlertTriangle } from "lucide-react"

export function IncidentForm() {
    const [type, setType] = useState('accident')
    const [description, setDescription] = useState('')
    const [vehicleNumber, setVehicleNumber] = useState('')
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [locationLoading, setLocationLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const getLocation = () => {
        setLocationLoading(true)
        if (!navigator.geolocation) {
            setError('Geolocation is not supported. Please enable GPS for accuracy.')
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
                setError('Unable to retrieve location. This is crucial for emergency response.')
                setLocationLoading(false)
            },
            { enableHighAccuracy: true }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!location) {
            setError('CRITICAL: Location is required for emergency response.')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { error: insertError } = await supabase
                .from('incidents')
                .insert({
                    user_id: user.id,
                    type,
                    description,
                    vehicle_number: vehicleNumber,
                    latitude: location.lat,
                    longitude: location.long,
                    priority: 'HIGH', // Emergency is always High Priority
                    status: 'reported'
                })

            if (insertError) throw insertError

            // Here we would trigger real-time alerts or SMS

            router.push('/dashboard?incident_reported=true')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to report incident')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto border-red-500 border-2 shadow-red-100">
            <CardHeader className="bg-red-50 text-red-900">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <CardTitle>Emergency / Accident Report</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="type">Incident Type</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accident">Road Accident</SelectItem>
                                <SelectItem value="fire">Fire Outbreak</SelectItem>
                                <SelectItem value="medical">Medical Emergency</SelectItem>
                                <SelectItem value="crime">Crime / Threat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vehicle">Vehicle Number (Optional)</Label>
                        <Input
                            id="vehicle"
                            placeholder="e.g. TN-01-AB-1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description / Notes</Label>
                        <Textarea
                            id="desc"
                            placeholder="Brief details (Injuries, fire size, etc.)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-red-600 font-bold">Location (GPS Required)</Label>
                        <div className="flex gap-2 items-center">
                            <Button type="button" variant="destructive" onClick={getLocation} disabled={locationLoading} className="w-full">
                                {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                {location ? 'Location Updated' : 'Capture Current Location'}
                            </Button>
                        </div>
                        {location && <span className="text-xs text-green-600 font-semibold block text-center">Latitude: {location.lat}, Longitude: {location.long}</span>}
                    </div>

                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-lg" disabled={loading}>
                        {loading ? 'Alerting Authorities...' : 'REPORT EMERGENCY'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
