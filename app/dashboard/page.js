"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Package, Crown, Clock, Wallet } from 'lucide-react';
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
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primaryGlow flex items-center justify-center text-3xl font-bold text-black shadow-2xl shadow-primary/20 shrink-0">
                        {user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">Xin chào, {user.username}</h1>
                        <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded w-fit mt-2">
                            <Crown size={16} /> Thành viên VIP
                        </div>
                    </div>
                </div>

                <div className="md:ml-auto md:text-right p-4 bg-surfaceHighlight/20 rounded-xl md:bg-transparent md:p-0">
                    <p className="text-gray-400 text-sm">Số dư khả dụng</p>
                    <p className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-yellow-400 to-yellow-600">
                        {user.balance.toLocaleString()} VNĐ
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard label="Tổng đơn hàng" value={orders.length} icon={<Package className="text-blue-400" />} />
                <StatCard label="Số dư hiện tại" value={`${user.balance.toLocaleString()} VNĐ`} icon={<Wallet className="text-yellow-400" />} />
                <Link href="/deposit" className="md:col-span-1">
                    <div className="h-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 flex flex-col justify-center items-center hover:bg-green-500/30 transition cursor-pointer group">
                        <span className="text-green-400 font-bold text-xl group-hover:scale-110 transition-transform">+ Nạp Thêm Tiền</span>
                    </div>
                </Link>

                {/* Admin Link */}
                {user.role === 'admin' && (
                    <Link href="/admin" className="md:col-span-3 bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-red-900/40 transition group">
                        <Crown className="text-red-500 group-hover:animate-spin" />
                        <span className="text-red-400 font-bold uppercase tracking-widest">Truy cập Admin Panel</span>
                    </Link>
                )}
            </div>

            {/* Recent Orders */}
            <h2 className="text-2xl font-display font-bold mb-6">Lịch Sử Mua Hàng</h2>
            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden mb-12">
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
                                        {order.items.map(item => `${item.productId?.name || 'Unknown'} (x${item.quantity})`).join(', ')}
                                    </td>
                                    <td className="p-4 font-mono text-primary font-bold tracking-wider select-all cursor-pointer" title="Bấm để copy" onClick={() => navigator.clipboard.writeText(order.code || 'ĐANG XỬ LÝ')}>
                                        {order.code || 'ĐANG XỬ LÝ'}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {order.status === 'completed' ? 'Thành công' : 'Đang xử lý'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-gray-300">
                                        -{order.totalAmount.toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Gacha History */}
            <GachaHistorySection />
        </div>
    );
}

function GachaHistorySection() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/gacha/history')
            .then(res => setHistory(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center text-gray-500">Đang tải lịch sử quay...</div>;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-6 text-yellow-500 flex items-center gap-2">
                <Crown size={24} /> Lịch Sử Quay Gacha
            </h2>
            <div className="bg-[#141414] rounded-2xl border border-yellow-500/20 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-yellow-500/10 text-yellow-200 text-sm uppercase">
                        <tr>
                            <th className="p-4">Hòm</th>
                            <th className="p-4">Vật phẩm trúng</th>
                            <th className="p-4">Mã Code</th>
                            <th className="p-4">Độ hiếm</th>
                            <th className="p-4 text-right">Chi phí</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có lượt quay nào.</td></tr>
                        ) : (
                            history.map(item => (
                                <tr key={item._id} className="hover:bg-white/5 transition">
                                    <td className="p-4 text-gray-300">{item.caseName}</td>
                                    <td className="p-4 font-bold text-white flex items-center gap-2">
                                        <div className="w-8 h-8 relative rounded overflow-hidden border border-white/10">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.itemImage} alt="" className="object-cover w-full h-full" />
                                        </div>
                                        {item.itemName}
                                    </td>
                                    <td className="p-4 font-mono text-yellow-400 font-bold tracking-wider select-all cursor-pointer" title="Bấm để copy">
                                        {item.code}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getRarityStyle(item.rarity)}`}>
                                            {item.rarity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-gray-400">
                                        -{item.pricePaid.toLocaleString()} VNĐ
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

function getRarityStyle(rarity) {
    const styles = {
        'Common': 'text-gray-400 border-gray-500 bg-gray-900',
        'Uncommon': 'text-green-400 border-green-500 bg-green-900',
        'Rare': 'text-blue-400 border-blue-500 bg-blue-900',
        'Epic': 'text-purple-400 border-purple-500 bg-purple-900',
        'Legendary': 'text-yellow-400 border-yellow-500 bg-yellow-900',
        'HyperChrome': 'text-red-400 border-red-500 bg-red-900',
        'Godly': 'text-rose-400 border-rose-500 bg-rose-900',
        'Secret': 'text-white border-red-600 bg-red-600 animate-pulse'
    };
    return styles[rarity] || 'text-gray-400';
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
