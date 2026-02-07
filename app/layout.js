import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StyledJsxRegistry from "./registry";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-heading" });

export const metadata = {
  title: "Ristorante Elegante",
  description: "Un'esperienza culinaria indimenticabile",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable}`}>
        <StyledJsxRegistry>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
