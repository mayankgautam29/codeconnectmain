import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ResponsiveSidebar } from "@/app/components/ResponsiveSidebar";
import { PageHeader } from "@/components/PageHeader";
import WavyBackground from "@/components/background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeConnect — Developer Social Network",
  description: "Connect, showcase, and discover builders. Share your projects, find developers, and chat in real-time.",
  keywords: ["developers", "social network", "code", "portfolio", "community"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased text-white relative bg-[#05080f]`}
        >
          <WavyBackground />

          <div className="min-h-screen relative z-10">
            <ResponsiveSidebar />

            <main className="main-shell min-h-screen px-4 pt-4 pb-24 md:pb-6 md:px-6 lg:px-8">
              <PageHeader />
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

