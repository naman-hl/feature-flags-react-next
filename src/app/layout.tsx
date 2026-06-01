import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Feature Flags",
  description: "Co authored by Naman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
