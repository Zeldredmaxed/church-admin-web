import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "New Birth Admin — Pastor's Dashboard",
  description: "Administrative dashboard for New Birth Praise and Worship Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
