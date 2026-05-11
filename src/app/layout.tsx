import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlitchProduct | AI Marking Bot",
  description: "Secure, Multi-Model AI Assessment Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* We load marked here for the simple parser in page.tsx */}
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" async></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
