"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (error) {
            console.error(error);
            // Don't show error if 401 (handled by interceptor) or just empty
            if (error.response?.status !== 404) {
                // addToast('Không thể tải lịch sử đơn hàng', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 border-yellow-400';
            case 'completed': return 'text-green-400 border-green-400';
            case 'cancelled': return 'text-red-400 border-red-400';
            default: return 'text-gray-400 border-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="min-h-screen py-20 px-4 md:px-8 bg-[#050b14] bg-grid-pattern">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter skew-x-[-10deg]">
                        Lịch Sử Đơn Hàng
                    </h1>
                    <p className="text-gray-400">Theo dõi trạng thái đơn hàng của bạn</p>
                </div>

                {!user ? (
                    <div className="text-center py-20 bg-[#0f1923] border border-white/10 rounded-xl">
                        <p className="text-gray-400 mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
                        <Link href="/login">
                            <Button className="bg-primary text-black font-bold uppercase tracking-wider">Đăng Nhập Ngay</Button>
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-[#0f1923] border border-white/10 rounded-xl">
                        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-4">Bạn chưa có đơn hàng nào</p>
                        <Link href="/shop">
                            <Button className="bg-primary text-black font-bold uppercase tracking-wider">Mua Sắm Ngay</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#0f1923] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-primary/30 transition-colors shadow-lg"
                            >
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 uppercase tracking-wider ${getStatusColor(order.status)} bg-white/5`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                        <span className="text-gray-500 text-xs font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                                    </div>

                                    <div className="space-y-1">
                                        {order.items.map((item, idx) => (
                                            <p key={idx} className="text-white font-medium">
                                                {item.quantity}x <span className="text-gray-300">{item.product?.name || 'Sản phẩm đã xóa'}</span>
                                            </p>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-2">
                                    <p className="text-2xl font-display font-bold text-primary">
                                        {order.totalAmount?.toLocaleString()} VNĐ
                                    </p>

                                    {order.status === 'pending' && (
                                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                                            Thanh Toán
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
