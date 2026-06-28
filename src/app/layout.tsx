import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ResponsiveSidebar } from "@/app/components/ResponsiveSidebar";
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

            <main className="main-shell min-h-screen px-4 pt-5 pb-24 md:pb-8 md:px-8 lg:px-10">
              <header className="mb-6 md:mb-8 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                    CodeConnect
                  </h1>
                  <p className="text-sm md:text-base text-white/60 mt-1">
                    Connect, showcase, and discover builders.
                  </p>
                </div>
              </header>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

