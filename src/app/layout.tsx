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
    description: 'Your intelligent assistant for analyzing deals and making smart recommendations',
    images: [{
      url: '/textPreview.png',
      width: 1200,  // adjust these dimensions to match your actual image
      height: 630,  // adjust these dimensions to match your actual image
      alt: 'MERIDEX AI Preview',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MERIDEX AI',
    description: 'Your intelligent assistant for analyzing deals and making smart recommendations',
    images: ['/textPreview.png'],
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
