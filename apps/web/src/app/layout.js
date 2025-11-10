import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeScript from '@/components/theme/ThemeScript';

import Header from '@/components/forum/Header';
import Footer from '@/components/forum/Footer';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  // title: '%s | NodeBBS - GitHub Issue 风格的讨论社区',
  title: {
    template: '%s | NodeBBS - GitHub Issue 风格的讨论社区',
    default: 'NodeBBS - GitHub Issue 风格的讨论社区', // a default is required when creating a template
  },
  description: '一个现代化的技术讨论论坛，采用 GitHub Issue 风格设计',
};

function AppLayout({ children }) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Header />
      <EmailVerificationBanner />
      <div className='flex-1'>{children}</div>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning className='overflow-y-scroll'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeScript />
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster position='top-right' richColors />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
