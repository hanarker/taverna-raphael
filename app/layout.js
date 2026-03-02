import { Inter, Cinzel, Great_Vibes } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StyledJsxRegistry from "./registry";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-heading" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-accent" });

export const metadata = {
  title: "Taverna Raphael",
  description: "Cucina di mare autentica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} ${greatVibes.variable}`}>
        <StyledJsxRegistry>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
