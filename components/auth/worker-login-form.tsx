'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function WorkerLoginForm() {
    const [department, setDepartment] = useState('')
    const [workerId, setWorkerId] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!department || !workerId || !password) {
            setError('Please fill all fields')
            setLoading(false)
            return
        }

        try {
            let email = workerId.trim()
            if (!email.includes('@')) {
                email = `worker_${email}@scsms.local`
            }

            // 1. Attempt login
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: password.trim(),
            })

            if (authError || !user) {
                console.error("Auth Error:", authError);
                throw new Error('Invalid credentials.')
            }

            // 2. Verify Department Match
            // Fetch the worker profile to check department_id
            const { data: worker, error: workerError } = await supabase
                .from('workers')
                .select('department_id, departments(type)')
                .eq('email', user.email) // Assuming 1:1 mapping by email
                .single()

            if (workerError || !worker) {
                // Clean up session if worker profile missing
                await supabase.auth.signOut();
                console.error("Worker Profile Error:", workerError);
                throw new Error('Worker profile not found. Contact Admin.')
            }

            // Check if selected department matches the worker's actual department type
            // worker.departments is an object/array because of the join.
            // .single() on the main query means 'worker' is one object.
            // 'departments' will be an array or object depending on relationship. 
            // Usually it's an object if foreign key is used.
            // Let's safe check.
            const workerDeptType = Array.isArray(worker.departments) ? worker.departments[0]?.type : worker.departments?.type;

            if (workerDeptType !== department) {
                await supabase.auth.signOut();
                throw new Error(`Invalid Department. You belong to ${workerDeptType?.toUpperCase() || 'another'}.`);
            }

            router.push('/worker/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm bg-black/80 border-gray-800 text-white backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Worker Portal</CardTitle>
                <CardDescription className="text-gray-400">
                    Select department and enter your ID.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="dept" className="text-gray-300">Department</Label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger id="dept" className="bg-gray-900/50 border-gray-700 text-white h-12">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                <SelectItem value="electrical" className="focus:bg-gray-800 focus:text-white">Electrical</SelectItem>
                                <SelectItem value="road" className="focus:bg-gray-800 focus:text-white">Road</SelectItem>
                                <SelectItem value="water" className="focus:bg-gray-800 focus:text-white">Water</SelectItem>
                                <SelectItem value="police" className="focus:bg-gray-800 focus:text-white">Police</SelectItem>
                                <SelectItem value="maintenance" className="focus:bg-gray-800 focus:text-white">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="workerId" className="text-gray-300">Worker ID</Label>
                        <Input
                            id="workerId"
                            placeholder="e.g. W-101"
                            required
                            value={workerId}
                            onChange={(e) => setWorkerId(e.target.value)}
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
                        />
                    </div>
                    {error && <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
                    <Button type="submit" className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
