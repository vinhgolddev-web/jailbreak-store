"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '@/context/CartContext';
import { User, LogOut, Menu, X, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems, setIsOpen } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo - Minimalist Text */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-lg font-bold tracking-tight text-white">
                        Jailbreak <span className="text-gray-500">Store</span>
                    </span>
                    <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-[10px] font-medium text-gray-400">
                        Vinh Gold
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6">
                    <NavLink href="/shop">Cửa Hàng</NavLink>
                    <NavLink href="/deposit">Nạp Tiền</NavLink>

                    {/* Cart Trigger */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2 text-gray-400 hover:text-white transition group"
                    >
                        <ShoppingBag size={20} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 font-medium tracking-wider">SỐ DƯ</span>
                                <span className="text-sm font-semibold text-white">{user.balance?.toLocaleString()} VNĐ</span>
                            </div>

                            <div className="relative group">
                                <button className="flex items-center gap-2 px-1 hover:opacity-80 transition">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white uppercase">{user.username.substring(0, 2)}</span>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 pt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right">
                                    <div className="w-48 p-1 rounded-xl bg-black border border-white/10 shadow-2xl">
                                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                                            <p className="text-sm font-medium text-white truncate">{user.username}</p>
                                        </div>
                                        <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition">
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition mt-1"
                                        >
                                            Đăng Xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 pl-2">
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition">Đăng Nhập</Link>
                            <Link href="/register" className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition">
                                Đăng Ký
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle - Larger Touch Target */}
                <button
                    className="md:hidden p-3 -mr-2 text-gray-400 hover:text-white active:scale-95 transition"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle Menu"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-4">
                            <Link href="/shop" className="text-base font-medium p-3 rounded-lg bg-surfaceHighlight/30 text-gray-200 hover:text-white active:bg-surfaceHighlight" onClick={() => setMenuOpen(false)}>
                                Cửa Hàng
                            </Link>
                            <Link href="/deposit" className="text-base font-medium p-3 rounded-lg bg-surfaceHighlight/30 text-gray-200 hover:text-white active:bg-surfaceHighlight" onClick={() => setMenuOpen(false)}>
                                Nạp Tiền
                            </Link>
                            <button onClick={() => { setIsOpen(true); setMenuOpen(false); }} className="text-base font-medium p-3 rounded-lg bg-surfaceHighlight/30 text-gray-200 hover:text-white text-left flex items-center gap-3 active:bg-surfaceHighlight">
                                <ShoppingBag size={20} /> Giỏ Hàng ({totalItems})
                            </button>

                            {user ? (
                                <>
                                    <div className="h-px bg-white/10 my-2" />
                                    <Link href="/dashboard" className="text-base font-medium p-3 text-white">Dashboard ({user.username})</Link>
                                    <button onClick={() => { logout(); setMenuOpen(false) }} className="text-base font-medium p-3 text-red-500 text-left">Đăng Xuất</button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-4 border-t border-white/10 mt-2">
                                    <Link href="/login" className="w-full py-3 text-center text-base font-medium border border-white/10 rounded-xl text-white active:scale-95 transition">
                                        Đăng Nhập
                                    </Link>
                                    <Link href="/register" className="w-full py-3 text-center text-base font-medium bg-white text-black rounded-xl active:scale-95 transition">
                                        Đăng Ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

const NavLink = ({ href, children }) => (
    <Link href={href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-2 py-1">
        {children}
    </Link>
);
