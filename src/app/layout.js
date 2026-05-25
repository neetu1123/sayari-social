import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { MoodThemeProvider } from "@/components/MoodThemeContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Sayari.Social - AI Poetry & Dynamic Blogging Platform",
  description: "A premium social media network for poet creators to write Shayari, publish rich blogs, and share dynamic mood-synchronized audio and reels.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-black font-sans">
        <AuthProvider>
          <MoodThemeProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </MoodThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
