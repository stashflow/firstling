import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "First Ring | Phone Receptionist for Exterior Cleaning",
  description:
    "First Ring answers missed and after-hours calls for exterior cleaning businesses before the customer calls the next company.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.firstring.lol",
  ),
  applicationName: "First Ring",
  keywords: [
    "missed call receptionist",
    "AI receptionist",
    "pressure washing leads",
    "exterior cleaning",
    "after hours answering",
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "First Ring | Missed-Call Revenue Recovery",
    description:
      "A missed call can cost you a $400 job. First Ring answers missed and after-hours calls for exterior cleaning businesses.",
    url: "/",
    siteName: "First Ring",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "First Ring brand card",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "First Ring | Missed-Call Revenue Recovery",
    description:
      "A missed call can cost you a $400 job. First Ring answers missed and after-hours calls for exterior cleaning businesses.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={onest.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
