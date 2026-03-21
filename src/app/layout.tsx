import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campaign Generator - Brand-Aware Campaign Creation",
  description: "Turn your brand URL into campaign-ready assets with AI-powered brand extraction and campaign generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${GeistSans.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
