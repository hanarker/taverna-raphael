import { Cormorant_Garamond, Great_Vibes, Lato } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "./registry";
import PublicLayout from "./components/PublicLayout";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Taverna Raphael",
  description: "Taverna Raphael · Cucina di mare dal 1987",
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${greatVibes.variable} ${lato.variable}`}>
        <StyledJsxRegistry>
          <a href="#main-content" className="skip-link">Salta al contenuto</a>
          <PublicLayout>{children}</PublicLayout>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
