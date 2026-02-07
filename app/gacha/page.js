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
    const { addToast } = useToast();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [spinResult, setSpinResult] = useState(null);

    // New State for CS2 Animation
    const [rollItems, setRollItems] = useState([]);
    const [xOffset, setXOffset] = useState(0);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await api.get('/gacha');
            setCases(res.data);
        } catch (err) {
            console.error(err);
            addToast('Lỗi tải dữ liệu hòm', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCase = (gachaCase) => {
        if (!user) {
            addToast('Vui lòng đăng nhập để quay!', 'error');
            return;
        }
        setSelectedCase(gachaCase);
        setXOffset(0); // Reset position
        setRollItems([]);
    };

    const generateRollItems = (currCase, winner) => {
        const items = [];
        const totalItems = 50;
        const winnerIndex = 34; // Winner will be at this index

        for (let i = 0; i < totalItems; i++) {
            if (i === winnerIndex) {
                items.push({ ...winner, id: `winner-${i}` });
            } else {
                // Random random item from case
                const randomItem = currCase.items[Math.floor(Math.random() * currCase.items.length)];
                items.push({ ...randomItem, id: `random-${i}-${Math.random()}` });
            }
        }
        return items;
    };

    const handleSpin = async () => {
        if (!user || !selectedCase) return;
        if (user.balance < selectedCase.price) {
            addToast('Số dư không đủ!', 'error');
            return;
        }

        setSpinning(true);
        setSpinResult(null);

        try {
            const res = await api.post('/gacha/roll', { caseId: selectedCase._id });
            const { wonItem, visualItem, newBalance } = res.data;

            // Generate the strip using the Visual Item (what the spinner lands on)
            // If normal item, visualItem should vary or be equal to wonItem.
            // Backend should ensure visualItem is present. Fallback to wonItem if not.
            const targetItem = visualItem || wonItem;

            const strip = generateRollItems(selectedCase, targetItem);
            setRollItems(strip);

            // Calculate Target Offset
            // CaseWidth = 128px (w-32) + Gap = 16px (gap-4) = 144px per item
            // Winner Index = 34
            // Center of container (assume 500px wide? No, modal is max-w-2xl ~ 672px. Let's say viewport is 600px).
            // Actually, simplest is to center the *Winner Card*.
            // Target X = - (WinnerIndex * ItemWidth) + (ContainerHalfWidth) - (ItemHalfWidth)
            // Let's create a jitter for realism, but keep it centered enough.

            const cardWidth = 112; // w-28 = 7rem = 112px
            const gap = 8; // gap-2 = 0.5rem = 8px
            const itemTotalWidth = cardWidth + gap;
            const containerWidth = 460; // Approximate width of the window inside modal padding
            const winnerIndex = 34;

            // Random Jitter within the card (so it doesn't always stop dead center)
            const jitter = Math.floor(Math.random() * 40) - 20;

            const targetX = -((winnerIndex * itemTotalWidth) - (containerWidth / 2) + (cardWidth / 2)) + jitter;

            // Start animation implicitly by changing xOffset state? 
            // Better to use Framer Motion control, but simple state works if we pass it to 'animate'.
            setXOffset(targetX);

            setTimeout(() => {
                setSpinResult(wonItem);
                refreshUser();
                addToast(`Chúc mừng! Bạn nhận được ${wonItem.name}`, 'success');
                setSpinning(false);
            }, 6500); // 6s spin + 0.5s buffer

        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Lỗi khi quay', 'error');
            setSpinning(false);
        }
    };

    const closeModal = () => {
        if (spinning) return;
        setSelectedCase(null);
        setSpinResult(null);
        setRollItems([]);
        setXOffset(0);
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
                            className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative flex flex-col items-center"
                        >
                            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-primary mb-6">{selectedCase.name}</h2>

                            {/* CS2 Spinner Window */}
                            <div className="relative w-full h-40 bg-[#1a1a1a] rounded-lg mb-8 overflow-hidden border-4 border-[#2a2a2a] shadow-inner">
                                {/* Center Indicator Line */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-500 z-20 shadow-[0_0_10px_rgba(234,179,8,0.8)] transform -translate-x-1/2"></div>

                                <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-yellow-500 border-r-[8px] border-r-transparent"></div>
                                    <div className="absolute bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-yellow-500 border-r-[8px] border-r-transparent"></div>
                                </div>

                                {/* Rolling Track */}
                                <div className="h-full flex items-center">
                                    {spinning || spinResult ? (
                                        <motion.div
                                            className="flex gap-2 px-[50%]" // Start with padding to center initial items if needed? No, logic handles x.
                                            initial={{ x: 0 }}
                                            animate={{ x: xOffset }}
                                            transition={{ duration: 6, ease: [0.15, 0.85, 0.35, 1] }} // Bezier for that "slow down" feel
                                        >
                                            {rollItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`relative w-28 h-32 flex-shrink-0 bg-[#252525] border-b-4 ${getRarityBorderColor(item.rarity)} flex flex-col items-center justify-center p-2 rounded`}
                                                >
                                                    <div className="relative w-20 h-20 mb-1">
                                                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                                                    </div>
                                                    <span className={`text-[10px] font-bold truncate w-full text-center ${getRarityTextColor(item.rarity)}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        // Static Preview (Just show some random items)
                                        <div className="flex gap-2 justify-center w-full opacity-50 px-4 overflow-hidden">
                                            {selectedCase.items.slice(0, 5).map((item, idx) => (
                                                <div key={idx} className={`w-28 h-32 flex-shrink-0 bg-[#252525] border-b-4 ${getRarityBorderColor(item.rarity)} flex flex-col items-center justify-center p-2 rounded`}>
                                                    <div className="relative w-20 h-20 mb-1">
                                                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Win Result Message */}
                            <AnimatePresence>
                                {spinResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center mb-4"
                                    >
                                        <p className="text-gray-400 text-sm uppercase tracking-widest">Bạn đã nhận được</p>
                                        <p className={`text-2xl font-bold ${getRarityTextColor(spinResult.rarity)} drop-shadow-md`}>
                                            {spinResult.name}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Controls */}
                            <div className="w-full max-w-xs">
                                {!spinResult ? (
                                    <Button
                                        onClick={handleSpin}
                                        disabled={user.balance < selectedCase.price || spinning}
                                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                    >
                                        {spinning ? 'Đang quay...' : `Quay (${selectedCase.price.toLocaleString()} VNĐ)`}
                                    </Button>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button onClick={() => setSpinResult(null)} className="flex-1 bg-gray-600 hover:bg-gray-500">Quay Tiếp</Button>
                                        <Button onClick={closeModal} className="flex-1 bg-primary hover:bg-primary/80">Đóng</Button>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getRarityBorderColor(rarity) {
    const colors = {
        'Common': 'border-gray-500',
        'Uncommon': 'border-green-500',
        'Rare': 'border-blue-500',
        'Epic': 'border-purple-500',
        'Legendary': 'border-yellow-500',
        'HyperChrome': 'border-red-600',
        'Godly': 'border-rose-500',
        'Secret': 'border-red-900 shadow-[0_0_15px_rgba(255,0,0,0.5)]'
    };
    return colors[rarity] || 'border-gray-500';
}

function getRarityTextColor(rarity) {
    const colors = {
        'Common': 'text-gray-400',
        'Uncommon': 'text-green-400',
        'Rare': 'text-blue-400',
        'Epic': 'text-purple-400',
        'Legendary': 'text-yellow-400',
        'HyperChrome': 'text-red-500',
        'Godly': 'text-rose-500',
        'Secret': 'text-red-600 animate-pulse'
    };
    return colors[rarity] || 'text-gray-400';
}
