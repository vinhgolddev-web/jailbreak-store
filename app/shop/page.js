"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (productId) => {
        if (!user) return addToast('Login required to purchase.', 'error');

        try {
            await api.post('/orders', { productId });
            addToast('Purchase Successful! Item added to your account.', 'success');
            // Refresh User Balance & Product Stock without reloading
            await refreshUser();
            fetchProducts();
        } catch (err) {
            addToast(err.response?.data?.message || 'Purchase Failed', 'error');
        }
    };

    const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);
    const categories = ['All', 'Vehicle', 'Skin', 'Safe'];

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Marketplace</h1>
                    <p className="text-sm text-gray-400">Secure. Automated. Instant.</p>
                </div>

                <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-white/5 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${filter === cat
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>



            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onBuy={handleBuy}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
