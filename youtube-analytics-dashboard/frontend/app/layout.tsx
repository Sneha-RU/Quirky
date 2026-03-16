import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midnight Analytics | YouTube",
  description: "Conversational UI for YouTube Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
