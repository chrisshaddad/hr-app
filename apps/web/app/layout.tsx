import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';

import './globals.css';
import { SWRProvider } from '@/lib/swr-provider';
import { Toaster } from '@/components/atoms/Sonner/Sonner';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Humanline',
  description: 'Humanline HR Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <SWRProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SWRProvider>
      </body>
    </html>
  );
}
