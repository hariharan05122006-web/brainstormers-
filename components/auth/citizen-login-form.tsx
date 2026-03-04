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
        setMessage('')

        try {
            const trimmedOtp = otp.trim()

            if (trimmedOtp.length !== 6 && trimmedOtp.length !== 8) {
                throw new Error('Please enter the 6 or 8-digit code from your email.')
            }

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: trimmedOtp,
                type: 'email',
            })

            if (error) {
                if (error.message?.includes('expired') || error.message?.includes('invalid')) {
                    throw new Error('Code has expired or is invalid. Please request a new one.')
                }
                throw error
            }

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setLoading(true)
        setError('')
        setMessage('')
        setOtp('')

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            })

            if (error) throw error
            setMessage('New OTP sent to your email!')
        } catch (err: any) {
            if (err.message?.includes('rate limit') || err.message?.includes('Time limit')) {
                setError('Too many attempts. Please wait 60 seconds before trying again.')
            } else {
                setError(err.message || 'Failed to resend OTP')
            }
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
        <Card className="w-full max-w-sm card-tactical corner-marks rounded-none shadow-2xl shadow-black/50">
            <CardHeader className="text-center pb-4">
                {/* Tactical header bar */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1e2436]" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">Citizen Auth</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1e2436]" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-chakra)' }}>
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-[#6b7280] text-sm">
                    {step === 1 ? 'Sign in to access your dashboard' : 'Enter the code sent to your email'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 ? (
                    <div className="space-y-4">
                        {/* Toggle Method */}
                        <div className="flex rounded overflow-hidden border border-[#1e2436]">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('otp')}
                                className={`flex-1 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${loginMethod === 'otp'
                                    ? 'bg-[#d4a853] text-[#0a0c10]'
                                    : 'bg-[#0a0c10] text-[#6b7280] hover:text-[#e8e1d5]'
                                    }`}
                                style={{ fontFamily: 'var(--font-chakra)' }}
                            >
                                OTP Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('password')}
                                className={`flex-1 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${loginMethod === 'password'
                                    ? 'bg-[#d4a853] text-[#0a0c10]'
                                    : 'bg-[#0a0c10] text-[#6b7280] hover:text-[#e8e1d5]'
                                    }`}
                                style={{ fontFamily: 'var(--font-chakra)' }}
                            >
                                Password
                            </button>
                        </div>

                        {loginMethod === 'otp' ? (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Email Address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-tactical h-12 rounded-none"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-[#e84040]/10 border border-[#e84040]/30 text-[#e84040] text-sm rounded-none">
                                        <span className="font-mono text-[10px] tracking-wider uppercase mr-2">⚠ Alert:</span>{error}
                                    </div>
                                )}
                                {message && (
                                    <div className="p-3 bg-[#2dd4a8]/10 border border-[#2dd4a8]/30 text-[#2dd4a8] text-sm rounded-none">
                                        <span className="font-mono text-[10px] tracking-wider uppercase mr-2">✓ Status:</span>{message}
                                    </div>
                                )}

                                <button type="submit" className="btn-command w-full h-12 text-sm rounded-none cursor-pointer" disabled={loading}>
                                    {loading ? 'Transmitting...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Email Address</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-tactical h-12 rounded-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
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
                                    {loading ? 'Authenticating...' : 'Login'}
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="font-mono text-[10px] tracking-[0.15em] text-[#d4a853] uppercase">Verification Code</label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                required
                                maxLength={8}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="input-tactical h-14 rounded-none text-center text-2xl tracking-[0.5em]"
                                style={{ fontFamily: 'var(--font-chakra)' }}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-[#e84040]/10 border border-[#e84040]/30 text-[#e84040] text-sm rounded-none">
                                <span className="font-mono text-[10px] tracking-wider uppercase mr-2">⚠ Alert:</span>{error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-[#2dd4a8]/10 border border-[#2dd4a8]/30 text-[#2dd4a8] text-sm rounded-none">
                                <span className="font-mono text-[10px] tracking-wider uppercase mr-2">✓ Status:</span>{message}
                            </div>
                        )}

                        <button type="submit" className="w-full h-12 text-sm rounded-none cursor-pointer bg-[#2dd4a8] text-[#0a0c10] font-semibold uppercase tracking-wider hover:bg-[#3ae4b8] transition-all" style={{ fontFamily: 'var(--font-chakra)' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="text-sm text-[#6b7280] hover:text-[#d4a853] transition-colors cursor-pointer py-2"
                                onClick={() => { setStep(1); setError(''); setMessage(''); setOtp(''); }}
                            >
                                ← Change Email
                            </button>
                            <button
                                type="button"
                                className="text-sm text-[#6b7280] hover:text-[#2dd4a8] transition-colors cursor-pointer py-2"
                                onClick={handleResendOTP}
                                disabled={loading}
                            >
                                Resend Code →
                            </button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
