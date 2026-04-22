import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthModal from "@/components/auth/AuthModal";
import AuthProvider from "@/components/auth/AuthProvider";
import ContactModal from "@/components/contact/ContactModal";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TheElevatorShop – Elevator Parts & Supplies",
  description: "Premium elevator parts and components for every application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased">
        <AuthProvider>
          {children}
          <AuthModal />
          <ContactModal />
        </AuthProvider>
      </body>
    </html>
  );
}
