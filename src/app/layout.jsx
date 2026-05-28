import "./globals.css";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/next";

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
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
