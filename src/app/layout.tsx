/**
 * @fileoverview Root layout for the Next.js application.
 * @version 1.1.0
 * @since 2025-04-22
 * @updated 2025-04-23 - Wrapped children with ConfigurationProvider.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigurationProvider } from "@/context/ConfigurationContext"; // Import the provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * @constant metadata
 * @description Metadata for the application.
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "SSO Simulation Tool",
  description: "Simulate SSO flows for testing integration.",
};

/**
 * @component RootLayout
 * @description The root layout component for the application.
 * @description Wraps the entire application with necessary providers, including ConfigurationProvider.
 * @param {Readonly<{ children: React.ReactNode }>} props - Component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout.
 * @returns {React.ReactElement} The root layout element.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap the application content with the ConfigurationProvider */}
        <ConfigurationProvider>{children}</ConfigurationProvider>
      </body>
    </html>
  );
}
