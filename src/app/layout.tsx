import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plasma Figurine Generator",
  description: "Create your personalized isometric figurine with Plasma branding",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased gradient-bg min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
