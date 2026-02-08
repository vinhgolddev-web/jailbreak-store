"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Crown, Trophy, Medal, User } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/users/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return (
        <div className="min-h-screen pt-32 flex justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-2xl flex items-center justify-center gap-4">
                        <Trophy className="text-yellow-400 w-12 h-12 md:w-16 md:h-16" />
                        BXH <span className="text-primary text-glow">ĐẠI GIA</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Vinh danh những trùm Jailbreak giàu nhất server</p>
                </div>

                {/* Podium (Top 3) */}
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16">
                    {/* Top 2 */}
                    {top3[1] && <PodiumUser user={top3[1]} rank={2} color="text-gray-300" border="border-gray-400" bg="bg-gray-900/80" height="h-48" mb="mb-0" delay={0.2} />}

                    {/* Top 1 */}
                    {top3[0] && <PodiumUser user={top3[0]} rank={1} color="text-yellow-400" border="border-yellow-400" bg="bg-yellow-900/80" height="h-60" mb="mb-8" isChamp delay={0} />}

                    {/* Top 3 */}
                    {top3[2] && <PodiumUser user={top3[2]} rank={3} color="text-orange-400" border="border-orange-500" bg="bg-orange-900/80" height="h-40" mb="mb-0" delay={0.4} />}
                </div>

                {/* List (Rank 4-10) */}
                <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Medal className="text-blue-400" /> Top Cao Thủ
                        </h2>
                    </div>
                    {rest.map((user, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            key={user._id}
                            className="flex items-center gap-4 p-4 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                        >
                            <div className="w-8 h-8 flex items-center justify-center font-black text-gray-500 text-lg">
                                #{index + 4}
                            </div>
                            <Avatar user={user} size={48} />
                            <div className="flex-1">
                                <div className="font-bold text-lg">{user.username}</div>
                            </div>
                            <div className="font-mono font-bold text-primary text-xl">
                                {(user.totalDeposited || 0).toLocaleString()} VNĐ
                            </div>
                        </motion.div>
                    ))}
                    {rest.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Chưa có thêm dữ liệu.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

const PodiumUser = ({ user, rank, color, border, bg, height, mb, isChamp, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring" }}
        className={`flex flex-col items-center ${mb} w-full md:w-1/3 order-${rank === 1 ? 2 : rank === 2 ? 1 : 3}`}
    >
        <div className="relative mb-4">
            {isChamp && (
                <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce" size={32} />
            )}
            <div className={`rounded-full p-1 border-4 ${border} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                <Avatar user={user} size={isChamp ? 96 : 72} />
            </div>
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full ${bg} border-2 ${border} flex items-center justify-center font-black text-white shadow-lg`}>
                {rank}
            </div>
        </div>

        <div className={`w-full ${height} ${bg} rounded-t-3xl border-x-2 border-t-2 ${border} flex flex-col items-center justify-start py-6 backdrop-blur-sm relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            <h3 className={`font-black text-xl md:text-2xl truncate max-w-[90%] ${color} drop-shadow-md`}>
                {user.username}
            </h3>
            <p className="font-mono font-bold text-white text-lg mt-1 opacity-90">
                Đã nạp: {(user.totalDeposited || 0).toLocaleString()} VNĐ
            </p>
        </div>
    </motion.div>
);

const Avatar = ({ user, size }) => (
    <div className="relative rounded-full overflow-hidden bg-surface" style={{ width: size, height: size }}>
        {user.avatar ? (
            <Image src={user.avatar} alt={user.username} fill className="object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10 text-gray-400 font-bold text-xl">
                {user.username[0].toUpperCase()}
            </div>
        )}
    </div>
);
