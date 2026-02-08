"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, Box, Tag, Home, Search, Package, Crown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import SoundToggle from './SoundToggle';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { setIsOpen, totalItems } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = useMemo(() => [
        { href: '/', label: 'Home', icon: Home },
        { href: '/shop', label: 'Store', icon: Package },
        { href: '/gacha', label: 'Gacha', icon: Box },
        { href: '/leaderboard', label: 'BXH', icon: Crown }, // Added Leaderboard
        { href: '/sell-cars', label: 'Sell Cars', icon: Tag },
    ], []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className={`
                        glass rounded-2xl px-6 py-3 flex items-center justify-between
                        ${scrolled ? 'bg-[#0F1115]/90 border-white/5 shadow-2xl' : 'bg-[#0F1115]/50 border-transparent'}
                    `}>
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-8 h-8">
                                <span className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
                                <Image src="/logo.png" alt="Logo" width={32} height={32} className="relative z-10" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                                JB<span className="text-primary">Store</span>
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group"
                                >
                                    <link.icon size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search Button (Mobile/Desktop) */}
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                <Search size={20} />
                            </button>

                            {/* Sound Toggle */}
                            <SoundToggle />

                            {/* Cart */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="relative p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors group"
                            >
                                <ShoppingCart size={20} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            {/* Auth */}
                            {user ? (
                                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">

                                    <div className="text-right hidden lg:block">
                                        <div className="text-xs text-gray-400">Balance</div>
                                        <div className="text-sm font-bold text-primary truncate max-w-[120px]" title={formatCurrency(user.balance)}>
                                            {formatCurrency(user.balance)}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <Link href="/dashboard">
                                            <div className="w-9 h-9 rounded-full bg-surface border border-white/10 overflow-hidden relative">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-primary font-bold">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" sound={false}>Login</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm" sound={false}>Register</Button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2 text-white"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-4 rounded-xl bg-surface border border-white/5 flex items-center gap-4 text-lg font-medium active:scale-95 transition-transform"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <link.icon size={24} />
                                    </div>
                                    {link.label}
                                </Link>
                            ))}

                            {!user && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center">Login</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full justify-center">Register</Button>
                                    </Link>
                                </div>
                            )}

                            {user && (
                                <div className="mt-auto pb-8 border-t border-white/10 pt-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-surface border-2 border-primary overflow-hidden relative">
                                            {user.avatar ? (
                                                <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-primary font-bold text-xl">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{user.username}</div>
                                            <div className="text-primary font-mono">{(user.balance || 0).toLocaleString()} VNĐ</div>
                                        </div>
                                    </div>
                                    <Button variant="danger" onClick={logout} className="w-full justify-center">
                                        <LogOut size={18} /> Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
