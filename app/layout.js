import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LiveSalesNotification from '@/components/LiveSalesNotification';
import './globals.css';

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
      <body>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <LiveSalesNotification />
              <div id="cart-drawer-root" /> {/* Portal target if needed */}
              <main className="min-h-screen pt-20 relative">
                {/* Global Ambient Glow */}
                {/* Global Ambient Glow - REMOVED */}

                {children}
              </main>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
