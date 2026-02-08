"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ShoppingCart, Plus, Tag, Facebook, Store, User } from 'lucide-react';
import Link from 'next/link';

export default function MarketPage() {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);

    // Fetch Listings
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await api.get('/market');
                setListings(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const handlePurchase = async (listing) => {
        if (!user) return addToast('Vui lòng đăng nhập để mua hàng!', 'error');
        if (user.balance < listing.price) return addToast('Số dư không đủ!', 'error');
        if (confirm(`Bạn có chắc muốn mua "${listing.name}" với giá ${listing.price.toLocaleString()} VNĐ?`)) {
            setPurchasing(listing._id);
            try {
                const res = await api.post(`/market/buy/${listing._id}`);
                addToast(res.data.message, 'success');

                // Show Contact Info
                alert(`Giao dịch thành công! Liên hệ người bán qua Facebook: ${res.data.sellerFacebook}`);

                // Refresh UI
                setListings(prev => prev.filter(l => l._id !== listing._id));
                refreshUser();
            } catch (error) {
                addToast(error.response?.data?.message || 'Giao dịch thất bại', 'error');
            } finally {
                setPurchasing(null);
            }
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <Store className="text-primary" size={40} />
                            CHỢ <span className="text-primary">P2P</span>
                        </h1>
                        <p className="text-gray-400">Mua bán, trao đổi vật phẩm trực tiếp với người chơi khác.</p>
                    </div>

                    <div className="flex gap-3">
                        {user?.role === 'seller' ? (
                            <Link href="/market/create">
                                <Button className="shadow-lg shadow-primary/20">
                                    <Plus size={20} className="mr-2" /> Đăng Bán
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/market/register">
                                <Button variant="outline">
                                    Đăng Ký Bán Hàng
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Đang tải dữ liệu chợ...</div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-surface/50 rounded-2xl border border-white/5">
                        <Tag size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Chưa có vật phẩm nào</h3>
                        <p className="text-gray-500">Hãy là người đầu tiên đăng bán!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <motion.div
                                key={listing._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                            >
                                {/* Image */}
                                <div className="aspect-square relative bg-black/20">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={listing.image}
                                        alt={listing.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                        <User size={12} className="text-primary" />
                                        {listing.sellerId?.username || 'Ẩn danh'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-white text-lg mb-1 truncate">{listing.name}</h3>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-primary font-black text-xl">
                                            {listing.price.toLocaleString()} đ
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handlePurchase(listing)}
                                            disabled={purchasing === listing._id || user?._id === listing.sellerId?._id}
                                            className={user?._id === listing.sellerId?._id ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {purchasing === listing._id ? 'Xử lý...' : (user?._id === listing.sellerId?._id ? 'Của bạn' : 'Mua ngay')}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
