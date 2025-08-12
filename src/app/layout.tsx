import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guillaume Juste – Full-Stack Web Developer",
  description: "Portfolio showcasing projects, blog posts, and contact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-white text-slate-900">
            <header className="border-b">
              <nav className="container mx-auto px-4 h-14 flex items-center gap-6">
                <Link href="/" className="font-semibold">GJ</Link>
                <div className="flex items-center gap-4 text-sm text-slate-700">
                  <Link href="/projects" className="hover:underline">Projects</Link>
                  <Link href="/blog" className="hover:underline">Blog</Link>
                  <Link href="/contact" className="hover:underline">Contact</Link>
                </div>
              </nav>
            </header>
            <main className="container mx-auto px-4 py-8">{children}</main>
            <footer className="border-t">
              <div className="container mx-auto px-4 h-16 flex items-center text-sm text-slate-600">
                © {new Date().getFullYear()} Guillaume Juste
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
