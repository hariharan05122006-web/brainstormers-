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

            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password: password.trim(),
            })

            if (authError || !user) {
                console.error("Auth Error:", authError);
                throw new Error(authError?.message || 'Invalid credentials.')
            }

            const { data: worker, error: workerError } = await supabase
                .from('workers')
                .select('department_id, departments(type)')
                .eq('email', user.email)
                .single()

            if (workerError || !worker) {
                await supabase.auth.signOut();
                console.error("Worker Profile Error:", workerError);
                throw new Error('Worker profile not found. Contact Admin.')
            }

            const workerData = worker as any;
            const workerDeptType = Array.isArray(workerData.departments) ? workerData.departments[0]?.type : workerData.departments?.type;

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
        <Card className="w-full max-w-sm card-tactical corner-marks rounded-none shadow-2xl shadow-black/50">
            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1e2436]" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">Field Ops</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1e2436]" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                    Worker Portal
                </CardTitle>
                <CardDescription className="text-[#6b7280] text-sm">
                    Select department and enter credentials
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Department</label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger id="dept" className="input-tactical h-12 rounded-none [&>span]:text-[#e8e1d5]">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#12151c] border-[#1e2436] text-[#e8e1d5] rounded-none">
                                <SelectItem value="electrical" className="focus:bg-[#1e2436] focus:text-[#d4a853]">⚡ Electrical</SelectItem>
                                <SelectItem value="road" className="focus:bg-[#1e2436] focus:text-[#d4a853]">🛣 Road</SelectItem>
                                <SelectItem value="water" className="focus:bg-[#1e2436] focus:text-[#d4a853]">💧 Water</SelectItem>
                                <SelectItem value="police" className="focus:bg-[#1e2436] focus:text-[#d4a853]">🛡 Police</SelectItem>
                                <SelectItem value="maintenance" className="focus:bg-[#1e2436] focus:text-[#d4a853]">🔧 Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Worker ID</label>
                        <Input
                            id="workerId"
                            placeholder="e.g. W-101"
                            required
                            value={workerId}
                            onChange={(e) => setWorkerId(e.target.value)}
                            className="input-tactical h-12 rounded-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Password</label>
                        <Input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-tactical h-12 rounded-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-[#e84040]/10 border border-[#e84040]/30 text-[#e84040] text-sm rounded-none">
                            <span className="font-mono text-[10px] tracking-wider uppercase mr-2">⚠ Alert:</span>{error}
                        </div>
                    )}

                    <button type="submit" className="btn-command w-full h-12 text-sm rounded-none cursor-pointer" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Access Portal'}
                    </button>
                </form>
            </CardContent>
        </Card>
    )
}
