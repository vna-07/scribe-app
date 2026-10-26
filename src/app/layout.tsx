import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import GlobalThembaDrawer from "@/components/GlobalThembaDrawer";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrument = Instrument_Serif({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-instrument" 
});

export const metadata: Metadata = {
  title: "SCRIBE Intelligence",
  description: "Real records. Greater opportunities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SCRIBE",
  },
};

export const viewport: Viewport = {
  themeColor: "#14173F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrument.variable} antialiased`}>
        {/* Skip-to-content — visible only on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#5B5BE0] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
        >
          Skip to content
        </a>

        <OfflineBanner />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AppProvider>
              {children}
              <GlobalThembaDrawer />
              <InstallPrompt />
            </AppProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}