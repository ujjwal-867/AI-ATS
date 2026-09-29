import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";

import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI ATS Platform",
  description: "Enterprise AI Powered Applicant Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="page-background min-h-screen bg-white text-slate-900 antialiased">
        <ThemeProvider>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>

            <Toaster
              position="top-right"
              richColors
              expand
              closeButton
              toastOptions={{
                style: {
                  background: "#ffffff",
                  color: "#111827",
                  border: "1px solid #E5E7EB",
                  borderRadius: "14px",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.08)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}