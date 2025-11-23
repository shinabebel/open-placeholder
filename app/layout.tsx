import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const customSans = IBM_Plex_Sans({
  variable: '--font-custom-sans',
  subsets: ['latin'],
});

const customMono = IBM_Plex_Mono({
  variable: '--font-custom-mono',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'open placeholder',
  description: 'open placeholder',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${customSans.variable} ${customMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
