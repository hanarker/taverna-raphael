import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "./registry";
import PublicLayout from "./components/PublicLayout";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Taverna Raphael",
  description: "Taverna Raphael · Cucina di mare dal 2015",
};

export const viewport = {
  themeColor: "#0d232b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
        <StyledJsxRegistry>
          <a href="#main-content" className="skip-link">Salta al contenuto</a>
          <PublicLayout>{children}</PublicLayout>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
