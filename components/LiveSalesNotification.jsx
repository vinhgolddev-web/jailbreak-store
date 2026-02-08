'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../lib/axios';
import { ShoppingBag, X } from 'lucide-react';

export default function LiveSalesNotification() {
    const [notification, setNotification] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [shownIds, setShownIds] = useState(new Set());

    // Fetch recent orders every 30s
    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const res = await api.get('/orders/recent');
                if (res.data && res.data.length > 0) {
                    setRecentOrders(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch live sales", err);
            }
        };

        fetchRecentOrders();
        const interval = setInterval(fetchRecentOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Cycle through orders to show notifications
    useEffect(() => {
        if (recentOrders.length === 0) return;

        const showNextOrder = () => {
            // Find an order that hasn't been shown recently, or just pick random if all shown
            const order = recentOrders[Math.floor(Math.random() * recentOrders.length)];

            setNotification(order);

            // Hide after 5 seconds
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        };

        // Initial delay then random intervals
        const timer = setTimeout(showNextOrder, 5000);

        // Loop every 15-25 seconds
        const loop = setInterval(showNextOrder, Math.random() * 10000 + 15000);

        return () => {
            clearTimeout(timer);
            clearInterval(loop);
        };
    }, [recentOrders]);

    // Listen for custom close event (e.g. from "Khám phá store" button)
    useEffect(() => {
        const handleClose = () => setNotification(null);
        window.addEventListener('close-notifications', handleClose);
        return () => window.removeEventListener('close-notifications', handleClose);
    }, []);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    className="fixed bottom-4 left-4 z-50 max-w-sm w-full md:w-auto"
                >
                    <div className="bg-[#141414]/90 backdrop-blur-md border border-green-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 relative overflow-hidden group">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-green-500/10 blur-xl group-hover:bg-green-500/20 transition" />

                        <div className="relative p-3 bg-green-500/20 rounded-full text-green-400 shrink-0 animate-pulse">
                            <ShoppingBag size={20} />
                        </div>

                        <div className="relative pr-6">
                            <p className="text-xs text-gray-400 font-bold mb-0.5">Vừa có khách hàng mới!</p>
                            <p className="text-sm text-white font-medium">
                                <span className="text-primary font-bold">{notification.user}</span> đã mua <br />
                                <span className="text-green-400 font-bold">&quot;{notification.product}&quot;</span>
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {getTimeAgo(notification.time)}
                            </p>
                        </div>

                        <button
                            onClick={() => setNotification(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-white transition"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function getTimeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";

    return "Vừa xong";
}
