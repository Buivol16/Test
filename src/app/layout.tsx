import type { Metadata } from "next";
import { Geologica } from "next/font/google";
import "./globals.css";

const geologica = Geologica({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Livechat",
  description: "Chatting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geologica.className}>{children}</body>
    </html>
  );
}
