import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskFlow",
  description: "Sistema de chamados para coworkings"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
