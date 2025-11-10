import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { LoaderWrapper } from "@/components/loader-wrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vanesa Bodeguita",
  description: "Tu bodega de confianza con los mejores productos y precios",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vanesa Bodeguita",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#44943b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${inter.variable} font-inter antialiased`}
      >
        <LoaderWrapper>
          {children}
        </LoaderWrapper>
      </body>
    </html>
  );
}
