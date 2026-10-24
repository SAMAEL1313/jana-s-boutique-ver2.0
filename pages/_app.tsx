import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const body = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${heading.variable} ${body.variable} min-h-screen font-serif`}>
      <CartProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </CartProvider>
    </div>
  );
}
