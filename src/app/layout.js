import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "PrepTalk",
  description: "We help you upskill",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
