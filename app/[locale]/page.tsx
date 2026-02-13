import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Index' });

    return (
        <main
            className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center text-white"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')"
            }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 w-full max-w-md items-center justify-between font-mono text-sm lg:flex-none">
                <Card className="w-full shadow-2xl bg-black/80 border-gray-800 text-white backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight">Smart Civic & Safety<br />Management System</CardTitle>
                        <p className="text-gray-400 mt-2">Select your role to continue</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Link href="/login" className="w-full">
                            <Button className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200" variant="default">
                                Use as Citizen
                            </Button>
                        </Link>

                        <div className="flex gap-4">
                            <Link href="/worker/login" className="flex-1">
                                <Button className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" variant="outline">
                                    Worker
                                </Button>
                            </Link>
                            <Link href="/admin/login" className="flex-1">
                                <Button className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white" variant="outline">
                                    Admin
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
