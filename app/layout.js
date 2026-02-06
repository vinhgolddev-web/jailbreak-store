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
  title: 'Jailbreak Store | Premium Roblox Marketplace',
  description: 'The #1 place to buy cheap Jailbreak Cash, Vehicles, and Items. Instant delivery and ban-free guarantee.',
  keywords: 'roblox, jailbreak, cheap cash, trading, items',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
                  {/* Global Ambient Glow */}
                  {/* Global Ambient Glow - REMOVED */}

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
