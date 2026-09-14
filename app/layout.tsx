import type { Metadata } from "next";
import {
  Caveat,
  Kalam,
  Special_Elite,
  Playfair_Display,
  Inter,
  Bebas_Neue,
  Cormorant,
  Dancing_Script,
  Pacifico,
  Indie_Flower,
  Amatic_SC,
  Merriweather,
  Quicksand,
  Shadows_Into_Light,
  Courier_Prime,
} from "next/font/google";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "600", "700"] });
const kalam = Kalam({ subsets: ["latin"], variable: "--font-kalam", weight: ["300", "400", "700"] });
const specialElite = Special_Elite({ subsets: ["latin"], variable: "--font-special-elite", weight: ["400"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({ subsets: ["latin"], variable: "--font-bebas", weight: "400" });
const cormorant = Cormorant({ subsets: ["latin"], variable: "--font-cormorant", weight: ["300", "400", "500"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script", weight: ["400", "700"] });
const pacifico = Pacifico({ subsets: ["latin"], variable: "--font-pacifico", weight: "400" });
const indieFlower = Indie_Flower({ subsets: ["latin"], variable: "--font-indie-flower", weight: "400" });
const amaticSc = Amatic_SC({ subsets: ["latin"], variable: "--font-amatic-sc", weight: ["400", "700"] });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-merriweather", weight: ["300", "400", "700"] });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", weight: ["400", "500", "700"] });
const shadowsIntoLight = Shadows_Into_Light({ subsets: ["latin"], variable: "--font-shadows-into-light", weight: "400" });
const courierPrime = Courier_Prime({ subsets: ["latin"], variable: "--font-courier-prime", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Scrapbook Journal",
  description: "A cozy, hand-decorated journal that lives on your device.",
};

const fontVars = [
  caveat.variable,
  kalam.variable,
  specialElite.variable,
  playfair.variable,
  inter.variable,
  bebas.variable,
  cormorant.variable,
  dancingScript.variable,
  pacifico.variable,
  indieFlower.variable,
  amaticSc.variable,
  merriweather.variable,
  quicksand.variable,
  shadowsIntoLight.variable,
  courierPrime.variable,
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontVars} font-ui bg-[#4E1524] min-h-screen`}>{children}</body>
    </html>
  );
}
