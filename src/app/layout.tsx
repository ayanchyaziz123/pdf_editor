import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "PDF Toolkit",
  description: "A comprehensive tool for manipulating PDF files",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
