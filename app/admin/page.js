"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching
                const [usersRes, ordersRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/orders/all')
                ]);

                const users = usersRes.data;
                const orders = ordersRes.data;

                const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

                setStats({
                    totalUsers: users.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    recentOrders: orders.slice(0, 5) // Last 5 orders
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-10 w-48"><Skeleton className="h-full w-full" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="p-6 rounded-2xl bg-surfaceHighlight border border-white/5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={64} />
            </div>
            <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">Dashboard Overview</h1>
                    <p className="text-gray-400">Welcome back, Admin.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`${stats.totalRevenue.toLocaleString()} VNĐ`}
                    icon={DollarSign}
                    color="text-green-500"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-blue-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    color="text-purple-500"
                />
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-surfaceHighlight rounded-2xl border border-white/5 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-primary" /> Recent Activity
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-4">Order ID</th>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {stats.recentOrders?.map(order => (
                                <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 font-mono text-gray-400">#{order._id.slice(-6)}</td>
                                    <td className="py-4">
                                        <div className="font-medium text-white">{order.userId?.username || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{order.userId?.email}</div>
                                    </td>
                                    <td className="py-4 font-bold text-green-400">{order.totalAmount.toLocaleString()} VNĐ</td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stats.recentOrders?.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No orders yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
