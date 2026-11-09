import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Nanggala Climbing Club",
  description: "Aplikasi Monitoring Performa Atlet - Nanggala Climbing Club",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}