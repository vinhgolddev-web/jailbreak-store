import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LiveSalesNotification from '@/components/LiveSalesNotification';
import Footer from '@/components/Footer';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jailbreakstore.com'),
  title: {
    default: 'Jailbreak Store | Shop Cash & Items Uy Tín',
    template: '%s | Jailbreak Store'
  },
  description: 'Shop bán Cash, Item, và Xe Jailbreak Roblox uy tín số 1 Việt Nam. Giao dịch tự động, giá rẻ, an toàn 100%.',
  keywords: ['roblox', 'jailbreak', 'mua cash jailbreak', 'shop jailbreak', 'jailbreak items', 'uy tín', 'giá rẻ'],
  authors: [{ name: 'Jailbreak Store Team' }],
  creator: 'Jailbreak Store',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'Jailbreak Store | Shop Cash & Items Uy Tín',
    description: 'Shop bán Cash, Item, và Xe Jailbreak Roblox uy tín số 1 Việt Nam. Giao dịch tự động.',
    siteName: 'Jailbreak Store',
    images: [
      {
        url: '/logo.png', // Ensure this matches your public logo path
        width: 800,
        height: 600,
        alt: 'Jailbreak Store Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jailbreak Store | Shop Cash & Items Uy Tín',
    description: 'Shop bán Cash, Item, và Xe Jailbreak Roblox uy tín số 1 Việt Nam.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={font.className}>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <CartDrawer />
                <LiveSalesNotification />
                <div id="cart-drawer-root" /> {/* Portal target if needed */}
                <main className="flex-grow pt-20 relative">
                  {/* Global Ambient Glow - Removed for performance/cleanliness */}

                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
