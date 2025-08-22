import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import NewFeaturesList from "@/components/NewFeaturesList";

export const metadata: Metadata = {
  title: "Before30Bucket",
  description:
    'Create, share, and find inspiration for your "30 before 30" list.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Belleza&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        {/* <script src="https://accounts.google.com/gsi/client" async></script> */}
      </head>
      <body
        className={cn(
          "font-body antialiased min-h-screen flex flex-col items-center justify-center",
        )}
      >
        <Header />
        <NewFeaturesList />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
