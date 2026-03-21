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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "India Escapes",
  description: "India Escapes | Your Trusted Travel Partner",
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