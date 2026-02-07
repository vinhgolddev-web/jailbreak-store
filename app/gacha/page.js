"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Sparkles, X, Gift } from 'lucide-react';

export default function GachaPage() {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [spinResult, setSpinResult] = useState(null);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await api.get('/gacha');
            setCases(res.data);
        } catch (err) {
            console.error(err);
            showToast('Lỗi tải dữ liệu hòm', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCase = (gachaCase) => {
        if (!user) {
            showToast('Vui lòng đăng nhập để quay!', 'error');
            return;
        }
        setSelectedCase(gachaCase);
    };

    const handleSpin = async () => {
        if (!user || !selectedCase) return;
        if (user.balance < selectedCase.price) {
            showToast('Số dư không đủ!', 'error');
            return;
        }

        setSpinning(true);
        setSpinResult(null);

        try {
            // Call API to get result immediately
            const res = await api.post('/gacha/roll', { caseId: selectedCase._id });
            const { wonItem, newBalance } = res.data;

            // Wait for animation (simulated delay for now, real animation would use state)
            setTimeout(() => {
                setSpinResult(wonItem);
                refreshUser(); // Update balance in UI
                showToast(`Chúc mừng! Bạn nhận được ${wonItem.name}`, 'success');
                setSpinning(false);
            }, 3000); // 3 seconds spin time

        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'Lỗi khi quay', 'error');
            setSpinning(false);
        }
    };

    const closeModal = () => {
        if (spinning) return;
        setSelectedCase(null);
        setSpinResult(null);
    };

    return (
        <div className="container mx-auto px-4 py-10 min-h-screen">
            <h1 className="text-4xl font-bold text-white text-center mb-2">Vòng Quay May Mắn</h1>
            <p className="text-gray-400 text-center mb-10">Thử vận may - Nhận quà khủng</p>

            {loading ? (
                <div className="flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {cases.map((c) => (
                        <motion.div
                            key={c._id}
                            whileHover={{ y: -5 }}
                            className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col items-center hover:border-primary/50 transition-colors cursor-pointer group"
                            onClick={() => handleOpenCase(c)}
                        >
                            <div className="relative w-32 h-32 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Image src={c.image} alt={c.name} fill className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                            <div className="mt-auto pt-4 w-full border-t border-white/5 flex justify-between items-center">
                                <span className="text-yellow-400 font-bold">{c.price.toLocaleString()} VNĐ</span>
                                <Button size="sm" className="bg-white/10 hover:bg-white/20">Mở Ngay</Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Spin Modal */}
            <AnimatePresence>
                {selectedCase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden"
                        >
                            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white text-center mb-6">{selectedCase.name}</h2>

                            {/* Spinner Area */}
                            <div className="relative h-48 bg-black/50 rounded-xl mb-6 overflow-hidden border border-white/10 flex items-center justify-center">
                                {spinning ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-primary animate-pulse font-bold">Đang quay...</p>
                                    </div>
                                ) : spinResult ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className={`relative w-24 h-24 mb-2 p-2 rounded-full border-2 ${getRarityColor(spinResult.rarity)} bg-current/10`}>
                                            <Image src={spinResult.image} alt={spinResult.name} fill className="object-contain p-2" />
                                        </div>
                                        <p className="text-lg font-bold text-white">{spinResult.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${getRarityColor(spinResult.rarity)}`}>{spinResult.rarity}</span>
                                    </motion.div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <Gift size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>Nhấn quay để bắt đầu</p>
                                    </div>
                                )}
                            </div>

                            {/* Drop Rates Hint */}
                            {!spinning && !spinResult && (
                                <div className="mb-6 flex flex-wrap gap-2 justify-center">
                                    {selectedCase.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded text-[10px] text-gray-400 border border-white/5">
                                            <span className={`w-2 h-2 rounded-full bg-current ${getRarityColor(item.rarity).split(' ')[0]}`} />
                                            {item.probability}%
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex justify-center">
                                {!spinResult ? (
                                    <Button
                                        onClick={handleSpin}
                                        disabled={user.balance < selectedCase.price || spinning}
                                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
                                    >
                                        {spinning ? 'Đang quay...' : `Quay (${selectedCase.price.toLocaleString()} VNĐ)`}
                                    </Button>
                                ) : (
                                    <Button onClick={closeModal} className="w-full">Nhận Quà</Button>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getRarityColor(rarity) {
    const colors = {
        'Common': 'text-gray-400 border-gray-400/20',
        'Uncommon': 'text-green-400 border-green-400/20',
        'Rare': 'text-blue-400 border-blue-400/20',
        'Epic': 'text-purple-400 border-purple-400/20',
        'Legendary': 'text-yellow-400 border-yellow-400/20',
        'HyperChrome': 'text-red-500 border-red-500/20',
        'Godly': 'text-rose-500 border-rose-500/20'
    };
    return colors[rarity] || colors['Common'];
}
