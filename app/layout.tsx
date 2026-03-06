import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmailAI – Write emails in your voice",
  description: "AI-powered email composer trained on your writing style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
          <a href="/" className="text-lg font-semibold tracking-tight text-white">
            EmailAI
          </a>
          <nav className="flex gap-5 text-sm text-gray-400">
            <a href="/setup" className="hover:text-white transition-colors">Setup</a>
            <a href="/compose" className="hover:text-white transition-colors">Compose</a>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
