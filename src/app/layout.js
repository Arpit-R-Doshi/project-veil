import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

// 1. Configure Fonts
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-space' });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "Project Veil",
  description: "Anonymous Blockchain Crime Reporting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans bg-black text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}