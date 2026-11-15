import type { Metadata } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import './globals.css';

const bodoni = Bodoni_Moda({
  variable: '--font-bodoni',
  subsets: ['latin'],
  display: 'swap',
});

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FitMatch – Cross-Brand Size Finder & Virtual Trial Room',
  description: 'Know your size in every brand. Skip the trial room queue.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F6F3EE] text-[#0E0E0E] font-sans selection:bg-[#8C1D2F] selection:text-white">
        {children}
      </body>
    </html>
  );
}
