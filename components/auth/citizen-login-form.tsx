'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CitizenLoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1) // 1: Email, 2: OTP
    const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            })

            if (error) throw error

            setStep(2)
            setMessage('OTP sent to your email!')
        } catch (err: any) {
            // Suppress console error to prevent Next.js overlay in dev
            if (err.message?.includes('rate limit') || err.message?.includes('Time limit')) {
                setError('Too many attempts. Please wait 60 seconds before trying again.')
            } else {
                setError(err.message || 'Failed to send OTP')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            })

            if (error) throw error

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm bg-black/80 border-gray-800 text-white backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                    {step === 1 ? 'Sign in to access your dashboard' : 'Enter the 6-digit code sent to your email'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 ? (
                    <div className="space-y-4">
                        {/* Toggle Method */}
                        <div className="flex justify-center gap-4 mb-4">
                            <Button
                                variant={loginMethod === 'otp' ? 'default' : 'ghost'}
                                onClick={() => setLoginMethod('otp')}
                                className={loginMethod === 'otp' ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400"}
                                size="sm"
                            >
                                OTP Login
                            </Button>
                            <Button
                                variant={loginMethod === 'password' ? 'default' : 'ghost'}
                                onClick={() => setLoginMethod('password')}
                                className={loginMethod === 'password' ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400"}
                                size="sm"
                            >
                                Password Login
                            </Button>
                        </div>

                        {loginMethod === 'otp' ? (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
                                    />
                                </div>

                                {error && <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200"><AlertDescription>{error}</AlertDescription></Alert>}
                                {message && <Alert className="bg-green-900/50 border-green-900 text-green-200"><AlertDescription>{message}</AlertDescription></Alert>}

                                <Button type="submit" className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0" disabled={loading}>
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
                                    />
                                </div>

                                {error && <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200"><AlertDescription>{error}</AlertDescription></Alert>}

                                <Button type="submit" className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0" disabled={loading}>
                                    {loading ? 'Logging In...' : 'Login'}
                                </Button>
                            </form>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                required
                                maxLength={8}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 h-12 text-center text-2xl tracking-[1em]"
                            />
                        </div>

                        {error && <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200"><AlertDescription>{error}</AlertDescription></Alert>}

                        <Button type="submit" className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white border-0" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-gray-400 hover:text-white"
                            onClick={() => setStep(1)}
                        >
                            Change Email
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
