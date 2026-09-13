import type { Metadata } from "next";
import { Caveat, Kalam, Special_Elite, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "600", "700"] });
const kalam = Kalam({ subsets: ["latin"], variable: "--font-kalam", weight: ["300", "400", "700"] });
const specialElite = Special_Elite({ subsets: ["latin"], variable: "--font-special-elite", weight: ["400"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Scrapbook Journal",
  description: "A cozy, hand-decorated journal that lives on your device.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${caveat.variable} ${kalam.variable} ${specialElite.variable} ${playfair.variable} ${inter.variable} font-ui bg-[#d8c9ad] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
