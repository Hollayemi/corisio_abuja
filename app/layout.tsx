import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "./components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luxol.com"),
  title: {
    default: "Luxol Market | Fresh Meat, Groceries & Livestock Delivery",
    template: "%s | Luxol Market",
  },
  description:
    "Shop fresh meat, grains, vegetables, bakery and groceries online. Build your own Signature Meat Box, order livestock in bulk, plan your freezer, and enjoy flexible subscriptions with fast doorstep delivery.",
  keywords: [
    "Luxol Market",
    "fresh meat delivery",
    "online grocery store",
    "meat box subscription",
    "buy livestock online",
    "freezer planner",
    "grocery delivery Nigeria",
    "butcher delivery",
    "wholesale meat",
    "grocery subscription",
  ],
  authors: [{ name: "Luxol Market" }],
  creator: "Luxol Market",
  publisher: "Luxol Market",
  applicationName: "Luxol Market",
  category: "ecommerce",
  icons: {
    icon: "/images/store-flyer.jpeg",
    shortcut: "/images/store-flyer.jpeg",
    apple: "/images/store-flyer.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://luxolmarket.com",
    siteName: "Luxol Market",
    title: "Luxol Market | Fresh Meat, Groceries & Livestock Delivery",
    description:
      "Order fresh meat, groceries and livestock online. Build custom Meat Boxes, plan your freezer, and manage flexible subscriptions with fast doorstep delivery.",
    images: [
      {
        url: "/images/store-flyer.jpeg",
        width: 1200,
        height: 630,
        alt: "Luxol Market — Fresh Meat, Groceries & Livestock Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxol Market | Fresh Meat, Groceries & Livestock Delivery",
    description:
      "Order fresh meat, groceries and livestock online. Build custom Meat Boxes, plan your freezer, and manage flexible subscriptions with fast doorstep delivery.",
    images: ["/images/store-flyer.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}