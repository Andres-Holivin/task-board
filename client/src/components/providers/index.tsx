"use client"

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <NextTopLoader showSpinner={false} color="#4A90E2" height={4} />
            <Toaster position="top-right" richColors closeButton expand />
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    )
}