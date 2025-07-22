import '@decision-copilot/infrastructure'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ErrorProvider, setupGlobalErrorHandling } from "@/components/error/ErrorProvider";
import { env } from '@/lib/env';

// Set up global error handling and performance monitoring
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
  // Performance monitoring is automatically initialized
  import("@/lib/performance/PerformanceMonitor");
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decision Copilot",
  description: "Helping teams make great decisions together",
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  authors: [{ name: 'David Laing' }],
  openGraph: {
    title: 'Decision Copilot',
    description: 'Helping teams make great decisions together',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decision Copilot',
    description: 'Helping teams make great decisions together',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary showError={env.NODE_ENV === 'development'}>
          <ErrorProvider>
            {children}
          </ErrorProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
