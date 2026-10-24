import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrument = Instrument_Serif({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-instrument" 
});

export const metadata: Metadata = {
  title: "SCRIBE Intelligence",
  description: "Real records. Greater opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="antialiased bg-[#F5F1E8] text-[#20221F]">
        {children}
      </body>
    </html>
  );
}