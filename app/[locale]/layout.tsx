import type { Metadata } from "next";
import { Chakra_Petch, Rajdhani } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

const chakraPetch = Chakra_Petch({
    variable: "--font-chakra",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const rajdhani = Rajdhani({
    variable: "--font-rajdhani",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "SCSMS — Smart Civic & Safety Management System",
    description: "Tactical operations platform for civic issue reporting and emergency response.",
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale} className="dark">
            <body
                className={`${chakraPetch.variable} ${rajdhani.variable} antialiased tactical-bg`}
            >
                <div className="grain-overlay" aria-hidden="true" />
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
