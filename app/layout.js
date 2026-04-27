import { Poppins } from "next/font/google";
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { Toaster } from "../components/ui/sonner";
import { LanguageProvider } from "../context/LanguageContext";
import { CurrencyProvider } from "../context/CurrencyContext";
import GoogleTranslate from "../components/GoogleTranslate";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "Exotic India Travel Packages & Tailor-Made Tours | India Escapes",
  description: "Discover exotic India escapes with tailor-made travel packages designed by local experts. Personalized itineraries, authentic experiences & seamless journeys. Get your free quote today!",
  openGraph: {
    title: "Exotic India Travel Packages & Tailor-Made Tours | India Escapes",
    description: "Discover exotic India escapes with tailor-made travel packages designed by local experts. Personalized itineraries, authentic experiences & seamless journeys. Get your free quote today!",
    url: "https://indiaescapes.com",
    siteName: "India Escapes",
    images: [{ url: "https://indiaescapes.com/og_image.png", width: 1200, height: 630, alt: "India Escapes" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exotic India Travel Packages & Tailor-Made Tours | India Escapes",
    description: "Discover exotic India escapes with tailor-made travel packages designed by local experts. Personalized itineraries, authentic experiences & seamless journeys. Get your free quote today!",
    images: ["https://indiaescapes.com/og_image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className={`${poppins.className}`} suppressHydrationWarning>
        <Toaster />
        <QueryProvider>
          <LanguageProvider>
            <GoogleTranslate />
            <CurrencyProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}