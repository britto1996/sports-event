import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReduxProvider from '@/components/ReduxProvider';
import ChatAssistant from '@/components/ChatAssistant';

export const metadata: Metadata = {
  title: 'La Cima | Live Sports Experience',
  description: 'Official digital platform for major sports events.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ReduxProvider>
          <Navbar />
          <main style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <Footer />
          <ChatAssistant />
        </ReduxProvider>
      </body>
    </html>
  );
}
