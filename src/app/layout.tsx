import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { LoaderWrapper } from "@/components/loader-wrapper";
import { AuthProvider } from "@/context/AuthContext";
import { StoreConfigProvider } from "@/context/StoreConfigContext";
import { OrderProvider } from "@/context/OrderContext";
import { StoreClosedOverlay } from "@/components/store-closed-overlay";
import { Toaster } from "@/components/ui/sonner";
import { StructuredData } from "@/components/structured-data";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";

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
  metadataBase: new URL('https://www.vanesabodeguita.com'),
  title: {
    default: "Vanesa Bodeguita | Tu bodega de confianza online",
    template: "%s | Vanesa Bodeguita"
  },
  description: "Tu bodega de confianza con los mejores productos y precios. Compra online y recoge en tienda. Abarrotes, bebidas, snacks, lácteos y más.",
  keywords: ["bodega online", "abarrotes", "productos frescos", "compras online", "bodega Lima", "snacks", "bebidas", "comida", "recojo en tienda"],
  authors: [{ name: "Vanesa Bodeguita" }],
  creator: "Vanesa Bodeguita",
  publisher: "Vanesa Bodeguita",
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
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://www.vanesabodeguita.com",
    title: "Vanesa Bodeguita | Tu bodega de confianza online",
    description: "Tu bodega de confianza con los mejores productos y precios. Compra online y recoge en tienda.",
    siteName: "Vanesa Bodeguita",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "Vanesa Bodeguita Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanesa Bodeguita | Tu bodega de confianza online",
    description: "Tu bodega de confianza con los mejores productos y precios. Compra online y recoge en tienda.",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '9_SuBKIZMoXuFnV3lDMX4PGjsAQKpzkBsUzir2yEeSc',
    // yandex: 'tu-código-de-yandex',
    // bing: 'tu-código-de-bing',
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
  const baseUrl = 'https://www.vanesabodeguita.com';
  
  return (
    <html lang="es">
      <head>
        <StructuredData data={generateOrganizationSchema(baseUrl)} />
        <StructuredData data={generateWebSiteSchema(baseUrl)} />
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} font-inter antialiased`}
      >
        <LoaderWrapper>
          <AuthProvider>
            <StoreConfigProvider>
              <OrderProvider>
                <StoreClosedOverlay />
                {children}
                <Toaster />
              </OrderProvider>
            </StoreConfigProvider>
          </AuthProvider>
        </LoaderWrapper>
      </body>
    </html>
  );
}
