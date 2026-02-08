"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ revenue: 0, users: 0, orders: 0 });
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
                return;
            }
            fetchDashboardData();
        }
    }, [user, authLoading, router]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, chartRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/chart'),
                api.get('/admin/orders')
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
            setRecentOrders(ordersRes.data);
        } catch (error) {
            console.error("Admin Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="min-h-screen pt-32 text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Tổng Doanh Thu"
                        value={`${stats.revenue.toLocaleString()} VNĐ`}
                        icon={<DollarSign className="text-green-400" size={24} />}
                        bg="bg-green-500/10" border="border-green-500/20"
                    />
                    <StatCard
                        title="Tổng Thành Viên"
                        value={stats.users.toLocaleString()}
                        icon={<Users className="text-blue-400" size={24} />}
                        bg="bg-blue-500/10" border="border-blue-500/20"
                    />
                    <StatCard
                        title="Tổng Đơn Hàng"
                        value={stats.orders.toLocaleString()}
                        icon={<ShoppingBag className="text-purple-400" size={24} />}
                        bg="bg-purple-500/10" border="border-purple-500/20"
                    />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" /> Biểu Đồ Doanh Thu (7 Ngày)
                        </h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FBBC04" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FBBC04" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="_id" stroke="#666" fontSize={12} tickFormatter={(str) => str.slice(5)} />
                                    <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }}
                                        itemStyle={{ color: '#FBBC04' }}
                                        formatter={(value) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#FBBC04" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions / Alerts */}
                    <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-400" /> Cần Xử Lý
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-sm">Hệ thống hoạt động bình thường.</p>
                                <p className="text-green-400 text-sm font-bold mt-1">Không có cảnh báo.</p>
                            </div>
                            {/* Placeholder for future alerts */}
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-gray-400" /> Đơn Hàng Mới Nhất
                        </h2>
                        <button className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Sản Phẩm</th>
                                    <th className="p-4">Giá Trị</th>
                                    <th className="p-4">Trạng Thái</th>
                                    <th className="p-4">Thời Gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{order.userId?.username || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{order.userId?.email}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {order.items.map(i => i.productId?.name).join(', ')}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-green-400">
                                            {order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, bg, border }) => (
    <div className={`p-6 rounded-2xl border ${border} ${bg} backdrop-blur-sm relative overflow-hidden group`}>
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition duration-500 select-none">
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);
