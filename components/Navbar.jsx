"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, Shield, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart, toggleCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'HOME' },
        { href: '/shop', label: 'SHOP' },
        { href: '/gacha', label: 'GACHA' },
        { href: '/sell-cars', label: 'SELL' },
        { href: '/orders', label: 'ORDERS' }, // Check if this exists?
    ];

    const isActive = (path) => pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050b14]/90 backdrop-blur-md border-b border-primary/30 shadow-neon-blue' : 'bg-transparent border-b border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary/10 rounded border border-primary/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-neon-blue">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase italic skew-x-[-10deg]">
                                JAILBREAK
                            </span>
                            <span className="text-[10px] text-primary font-bold tracking-[0.3em] -mt-1 uppercase">Store</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative font-display font-bold text-sm tracking-widest hover:text-primary transition-colors py-2 ${isActive(link.href) ? 'text-primary' : 'text-gray-400'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-neon-blue"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <button
                            onClick={toggleCart} // Assuming toggleCart is available from context
                            className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cart && cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-bold flex items-center justify-center rounded-full shadow-neon-red">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* Auth */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
                                <Link href="/dashboard" className="flex items-center gap-3 group">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Welcome</p>
                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.username}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                        <User className="w-5 h-5 text-gray-300 group-hover:text-primary" />
                                    </div>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="hidden md:block px-6 py-2 bg-primary/10 border border-primary/50 text-primary font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all shadow-neon-blue skew-x-[-10deg]">
                                    LOGIN
                                </button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-gray-300 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-[#050b14] border-t border-white/10 absolute top-20 left-0 right-0 shadow-2xl p-4 flex flex-col gap-4"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block p-4 text-center font-bold uppercase tracking-widest border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all ${isActive(link.href) ? 'bg-primary/10 border-primary/50 text-primary' : 'text-gray-400'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {!user && (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <button className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest shadow-neon-blue">
                                    Login / Register
                                </button>
                            </Link>
                        )}

                        {user && (
                            <div className="flex border-t border-white/10 pt-4 gap-2">
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex-1 py-3 bg-white/5 text-center font-bold text-white hover:bg-white/10">
                                    Profile ({user.username})
                                </Link>
                                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-4 py-3 bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
