import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/navigation/Navigation';
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'MERIDEX AI',
  description: 'Your intelligent assistant for analyzing deals and making smart recommendations',
  openGraph: {
    title: 'MERIDEX AI',
    description: 'Your intelligent assistant for analyzing real estate deals and providing valuable insights fast',
    images: [{
      url: 'https://meridexai.com/textPreview.png',
      width: 1200,
      height: 630,
      alt: 'MERIDEX AI Preview',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MERIDEX AI',
    description: 'Your intelligent assistant for analyzing real estate deals and providing valuable insights fast',
    images: ['https://meridexai.com/textPreview.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:image" content="https://meridexai.com/textPreview.png" />
        <meta property="og:image:secure_url" content="https://meridexai.com/textPreview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
