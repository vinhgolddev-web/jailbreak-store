"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useSoundSystem } from './SoundContext';
import api from '@/lib/axios';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();
    const { playSuccess } = useSoundSystem();

    // Flag to prevent initial sync from overwriting local changes if needed, 
    // but here we just want to merge or replace.
    // Simpler strategy:
    // 1. On Mount/Login -> Fetch DB Cart. If empty/null, check LocalStorage.
    // 2. On Change -> Save DB (if user) & LocalStorage.

    // Load cart
    useEffect(() => {
        const fetchCart = async () => {
            let dbCart = [];
            if (user) {
                try {
                    const res = await api.get('/cart');
                    if (res.data) dbCart = res.data;
                } catch (e) {
                    console.error('Failed to fetch DB cart', e);
                }
            }

            // Always check local storage too, maybe merge?
            // For now, simpler: DB wins if user logged in, else LocalStorage.
            // Or better: If DB has data, use it. If not, use local storage.
            if (dbCart.length > 0) {
                setCart(dbCart);
                localStorage.setItem('jb_cart', JSON.stringify(dbCart));
            } else {
                try {
                    const saved = localStorage.getItem('jb_cart');
                    if (saved) setCart(JSON.parse(saved));
                } catch (e) { console.error(e); }
            }
        };

        fetchCart();
    }, [user]);

    // Clear cart when user logs out (optional, but good for security)
    // Clear cart when user logs out
    useEffect(() => {
        if (!user && cart.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCart([]);
            localStorage.removeItem('jb_cart');
        }
    }, [user, cart.length]);

    // Save cart
    useEffect(() => {
        localStorage.setItem('jb_cart', JSON.stringify(cart));

        if (user) {
            // Debounced sync
            const timeoutId = setTimeout(() => {
                api.post('/cart/sync', { cart })
                    .catch(e => console.error('Failed to sync cart', e));
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [cart, user]);

    const addToCart = useCallback((product) => {
        // Redirect to login if not authenticated
        if (!user) {
            addToast('Please login to add items to cart', 'error');
            // Assuming we can access window directly here as it's a client component
            window.location.href = '/login';
            return;
        }

        const existing = cart.find(item => item._id === product._id);

        if (existing) {
            if (existing.quantity >= product.stock) {
                addToast('Max stock reached for this item', 'error');
                return;
            }
            addToast(`Updated quantity for ${product.name}`, 'success');
        } else {
            addToast(`${product.name} added to cart`, 'success');
        }

        setCart(prev => {
            const existingInPrev = prev.find(item => item._id === product._id);
            if (existingInPrev) {
                if (existingInPrev.quantity >= product.stock) return prev; // Guard
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Play success sound
        playSuccess();

        // setIsOpen(true); // Auto-open disabled
    }, [cart, user, addToast, playSuccess]);

    const removeFromCart = useCallback((productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, delta) => {
        if (delta > 0) {
            const item = cart.find(i => i._id === productId);
            if (item && item.quantity >= item.stock) {
                addToast('Max stock reached', 'error');
                return;
            }
        }

        setCart(prev => prev.map(item => {
            if (item._id === productId) {
                const newQty = item.quantity + delta;
                if (newQty < 1) return item;
                if (newQty > item.stock) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, [cart, addToast]);

    const clearCart = useCallback(async () => {
        setCart([]);
        localStorage.removeItem('jb_cart');

        if (user) {
            try {
                await api.post('/cart/sync', { cart: [] });
            } catch (e) {
                console.error('Failed to clear server cart', e);
            }
        }
    }, [user]);

    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isOpen,
            setIsOpen,
            totalAmount,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
