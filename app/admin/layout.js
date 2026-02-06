"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/dashboard'); // Kick out non-admins
            }
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-mono text-sm animate-pulse">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <div className="w-64 bg-surfaceHighlight border-r border-white/10 flex flex-col fixed h-full z-40">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-display font-bold text-white">Admin<span className="text-primary">Panel</span></h1>
                    <p className="text-xs text-gray-400 mt-1">Jailbreak VIP Store</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} /> Back to Site
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 pt-24 overflow-y-auto w-full">
                {children}
            </div>
        </div>
    );
}
