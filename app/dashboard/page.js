"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Package, Crown, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="pt-32 text-center text-gray-500 animate-pulse">Đang tải Dashboard...</div>;
    if (!user) return <div className="pt-32 text-center">Vui lòng đăng nhập</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primaryGlow flex items-center justify-center text-3xl font-bold text-black shadow-2xl shadow-primary/20">
                    {user.username[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold">Xin chào, {user.username}</h1>
                    <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded w-fit mt-2">
                        <Crown size={16} /> Thành viên VIP
                    </div>
                </div>
                <div className="ml-auto text-right hidden md:block">
                    <p className="text-gray-400 text-sm">Số dư khả dụng</p>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-yellow-400 to-yellow-600">
                        ${user.balance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard label="Tổng đơn hàng" value={orders.length} icon={<Package className="text-blue-400" />} />
                <StatCard label="Tuổi tài khoản" value="5 Ngày" icon={<Clock className="text-purple-400" />} />
                <Link href="/deposit" className="md:col-span-1">
                    <div className="h-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 flex flex-col justify-center items-center hover:bg-green-500/30 transition cursor-pointer group">
                        <span className="text-green-400 font-bold text-xl group-hover:scale-110 transition-transform">+ Nạp Thêm Tiền</span>
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            <h2 className="text-2xl font-display font-bold mb-6">Lịch Sử Đơn Hàng</h2>
            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Vật phẩm</th>
                            <th className="p-4">Mã bí mật</th>
                            <th className="p-4">Ngày mua</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-right">Giá</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id} className="hover:bg-white/5 transition">
                                    <td className="p-4 font-medium text-white">
                                        {order.items[0]?.productId?.name || 'Vật phẩm ẩn'}
                                    </td>
                                    <td className="p-4 font-mono text-primary font-bold tracking-wider select-all cursor-pointer" title="Bấm để copy" onClick={() => navigator.clipboard.writeText(order.secretCode || 'ĐANG XỬ LÝ')}>
                                        {order.secretCode || 'ĐANG XỬ LÝ'}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                                            {order.status === 'completed' ? 'Thành công' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-gray-300">
                                        -${order.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon }) => (
    <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold font-display">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
            {icon}
        </div>
    </div>
);
