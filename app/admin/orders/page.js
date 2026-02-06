"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/all')
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-display">All Orders</h1>

            <div className="bg-surfaceHighlight rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-sm">
                            <th className="py-4 pl-6">Order ID</th>
                            <th className="py-4">User</th>
                            <th className="py-4">Items</th>
                            <th className="py-4">Total</th>
                            <th className="py-4">Status</th>
                            <th className="py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {orders.map(order => (
                            <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-6 font-mono text-gray-500">#{order._id.slice(-6)}</td>
                                <td className="py-4 font-medium text-white">
                                    {order.userId?.username || 'Deleted User'}
                                </td>
                                <td className="py-4 text-gray-400">
                                    {order.items.map(item => item.productId?.name || 'Unknown Item').join(', ')}
                                </td>
                                <td className="py-4 font-bold text-green-400">${order.totalAmount.toLocaleString()}</td>
                                <td className="py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No orders found.</div>
                )}
            </div>
        </div>
    );
}
