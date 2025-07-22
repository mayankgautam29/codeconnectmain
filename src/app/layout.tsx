import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ResponsiveSidebar } from "@/app/components/ResponsiveSidebar";
import { ParticleBackground } from "@/components/particleBackground";
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
  title: "Code-Connect",
  description: "Made by Mayank Gautam",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased text-white relative bg-black`}
        >
          <WavyBackground />

          <div className="min-h-screen flex flex-col md:flex-row relative z-10">
            <ResponsiveSidebar />

            <main className="flex-1 p-6 md:p-10 overflow-auto m-4 md:my-8 md:mr-8">
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                CodeConnect
              </h1>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

