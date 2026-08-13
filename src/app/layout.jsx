import "./globals.css";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const body = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: "PrepTalk",
  description: "We help you upskill",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/preptalk-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/preptalk-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="antialiased">
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
