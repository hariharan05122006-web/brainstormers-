'use client'

import { useState } from 'react'
import { createWorkerAction } from '@/actions/create-worker'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface Department {
    id: string
    name: string
}

export function AddWorkerForm({ departments }: { departments: Department[] }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        const formData = new FormData(e.currentTarget)
        const result = await createWorkerAction(formData)

        if (result.error) {
            setError(result.error)
        } else {
            setMessage(result.message || 'Worker created successfully')
            // Reset form?
            const form = e.target as HTMLFormElement
            form.reset()
        }
        setLoading(false)
    }

    return (
        <Card className="w-full max-w-lg bg-black/60 border-white/10 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Add New Worker
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Create a new worker account and assign a department.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                        <Input
                            name="name"
                            id="name"
                            required
                            placeholder="John Doe"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="workerId" className="text-gray-300">Worker ID / Email</Label>
                        <Input
                            name="workerId"
                            id="workerId"
                            required
                            placeholder="worker@example.com"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                            name="password"
                            id="password"
                            type="password"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="departmentId" className="text-gray-300">Department</Label>
                        <Select name="departmentId" required>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-500/50">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="focus:bg-gray-800 focus:text-white">
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
                    {message && <Alert className="bg-green-500/10 border-green-500/20 text-green-200"><AlertDescription>{message}</AlertDescription></Alert>}

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Worker'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
