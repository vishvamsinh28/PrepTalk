/**
 * @file Root layout. Loads fonts, gates the app to desktop widths, and mounts
 * the shared nav — every route renders inside this.
 */

import "./globals.css";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import DesktopOnly from "./components/DesktopOnly";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/next";

/** Body typeface, exposed as `--font-body` for Tailwind and globals.css. */
const body = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

/** Display serif, exposed as `--font-display`. Used for titles and stat figures. */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

/**
 * Site-wide metadata: title, description, and favicon set.
 */
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

/**
 * Root layout wrapping every route.
 * The desktop gate lives here rather than per page, so no route can leak onto a
 * small screen by omission. `lg:contents` is what makes that free: the wrapper
 * drops out of the box tree at desktop widths, so page layouts render as if it
 * weren't there. `Navbar` decides for itself which routes it appears on.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The active route's page.
 * @returns {JSX.Element} The html document shell.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="antialiased">
        {/* PrepTalk is desktop-only: every route is gated here so no page can
            leak onto small screens. lg:contents keeps the wrapper out of the
            box tree on desktop, so page layouts are unaffected. */}
        <DesktopOnly />
        <div className="hidden lg:contents">
          <Navbar />
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
