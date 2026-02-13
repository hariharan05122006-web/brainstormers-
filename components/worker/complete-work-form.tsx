'use client'

import { useState } from 'react';
import { completeWorkAction } from '@/actions/complete-work';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function CompleteWorkForm({ complaintId }: { complaintId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await completeWorkAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Success
            router.push('/worker/dashboard'); // Redirect to dashboard
            router.refresh();
        }
    };

    return (
        <Card className="w-full max-w-md bg-black/60 border-white/10 text-white backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-xl">Upload Proof of Completion</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="complaintId" value={complaintId} />

                    <div className="space-y-4">
                        <Label className="text-gray-300">1. After Photo (Mandatory)</Label>

                        {/* Custom File Input Trigger */}
                        <div className="relative">
                            <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                capture="environment" // Opens camera on mobile
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleImageChange}
                            />
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                {preview ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="h-10 w-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-400 font-medium">Tap to Take Photo</span>
                                        <span className="text-xs text-gray-500 mt-1">or select from gallery</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-gray-300">2. Completion Notes</Label>
                        <Textarea
                            name="notes"
                            id="notes"
                            placeholder="Describe the work done..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-green-500/50 min-h-[100px]"
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-200">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-lg shadow-green-900/20"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-5 w-5" />
                                Complete Work
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-white/10 pt-4">
                <Button variant="link" className="text-gray-400" onClick={() => router.back()}>
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    );
}
