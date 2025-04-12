import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedSafe",
  description: "MedSafe - Sua plataforma de saúde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/AmeliaUPW03-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style>{`
          @font-face {
            font-family: 'Amelia UP W03 Regular';
            src: url('/fonts/AmeliaUPW03-Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
