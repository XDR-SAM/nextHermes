import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TrackingScripts } from "@/components/TrackingScripts";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Hermes — Premium Fashion & Electronics",
  description: "Premium fashion & lifestyle. Curated collections for the modern individual.",
  icons: { icon: "/favicon.ico" },
};

// This script runs synchronously BEFORE React hydrates — prevents flash of wrong theme
const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('hermes-theme');
    var theme = s ? JSON.parse(s).state?.theme : 'dark';
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script — runs before <body> paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} min-h-full flex flex-col antialiased`}>
        <TrackingScripts
          ga4MeasurementId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
          paddleVendorId={process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID}
          gtmContainerId={process.env.NEXT_PUBLIC_GTM_CONTAINER_ID}
          paddleEnvironment={
            (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production") || "production"
          }
        />
        {/* No null mount — children render server-side, hydration patches silently */}
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}