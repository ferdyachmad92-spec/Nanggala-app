import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nanggala Climbing Club",
  description: "Aplikasi Monitoring Performa Atlet - Nanggala Climbing Club",
  icons: {
    icon: "/logo.png",
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