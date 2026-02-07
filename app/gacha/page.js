"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Sparkles, X, Gift, Globe, User } from 'lucide-react';

export default function GachaPage() {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rollItems, setRollItems] = useState([]);
    const [wonItem, setWonItem] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // History State
    const [historyTab, setHistoryTab] = useState('global'); // 'global' or 'personal'
    const [globalHistory, setGlobalHistory] = useState([]);
    const [personalHistory, setPersonalHistory] = useState([]);

    const spinnerRef = useRef(null);
    const SPIN_DURATION = 6000; // 6 seconds

    useEffect(() => {
        fetchCases();
        fetchGlobalHistory();
        const interval = setInterval(fetchGlobalHistory, 10000); // Live update every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) {
            fetchPersonalHistory();
        }
    }, [user]);

    const fetchCases = async () => {
        try {
            const res = await api.get('/gacha');
            setCases(res.data);
        } catch (error) {
            console.error(error);
            addToast('Lỗi tải dữ liệu vòng quay', 'error');
        }
    };

    const fetchGlobalHistory = async () => {
        try {
            const res = await api.get('/gacha/recent');
            setGlobalHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch global history", error);
        }
    };

    const fetchPersonalHistory = async () => {
        if (!user) return;
        try {
            const res = await api.get('/gacha/history');
            setPersonalHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch personal history", error);
        }
    };

    const handleSpin = async () => {
        if (!user) {
            addToast('Vui lòng đăng nhập để quay!', 'error');
            return;
        }
        if (user.balance < selectedCase.price) {
            addToast('Số dư không đủ!', 'error');
            return;
        }

        setIsSpinning(true);
        setShowResult(false);
        setWonItem(null);

        try {
            const res = await api.post('/gacha/roll', { caseId: selectedCase._id });
            const { wonItem: result, visualItem, newBalance } = res.data;

            // Prepare spinner items
            const items = generateRollItems(selectedCase, visualItem || result);
            setRollItems(items);

            // Animate
            setTimeout(() => {
                if (spinnerRef.current) {
                    // Winner is at index 34
                    // Card Width = 112px (w-28)
                    // Gap = 8px (gap-2)
                    // Total Stride = 120px
                    // Container Center ~ 230px (460px / 2)
                    // Target = (34 * 120) + (112 / 2) - 230
                    // Jitter included in logic if needed, but simple center is fine for CSS transition
                    const scrollPosition = (34 * 120) - 174; // Adjusted for visual center

                    spinnerRef.current.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.35, 1)`;
                    spinnerRef.current.style.transform = `translateX(-${scrollPosition}px)`;
                }
            }, 100);

            // Show Result
            setTimeout(() => {
                setWonItem(result);
                setShowResult(true);
                setIsSpinning(false);
                refreshUser(); // Update balance
                fetchPersonalHistory(); // Update history immediately

                // Motivation Message
                const msg = getMotivationMessage(result.rarity || 'Common');
                if (result.rarity === 'Godly' || result.rarity === 'Secret' || result.rarity === 'HyperChrome') {
                    addToast(`TRÚNG LỚN: ${result.name}!`, 'success');
                } else {
                    addToast(msg, 'info');
                }

            }, SPIN_DURATION + 500);

        } catch (error) {
            setIsSpinning(false);
            addToast(error.response?.data?.message || 'Lỗi khi quay', 'error');
        }
    };

    const generateRollItems = (currCase, winner) => {
        const items = [];
        const totalItems = 50;
        const winnerIndex = 34;

        // Find high tier items for bait
        const baitItems = currCase.items.filter(i => ['Godly', 'Secret', 'HyperChrome'].includes(i.rarity));
        const baitItem = baitItems.length > 0 ? baitItems[Math.floor(Math.random() * baitItems.length)] : null;

        const triggerNearMiss = Math.random() < 0.001; // 0.1% chance

        for (let i = 0; i < totalItems; i++) {
            if (i === winnerIndex) {
                items.push({ ...winner, id: `winner-${i}` });
            } else if (i === winnerIndex + 1 && baitItem && triggerNearMiss && (winner.rarity === 'Common' || winner.rarity === 'Uncommon')) {
                // Near Miss
                items.push({ ...baitItem, id: `bait-${i}-${Math.random()}` });
            } else {
                // Random filler
                const randomItem = currCase.items[Math.floor(Math.random() * currCase.items.length)];
                items.push({ ...randomItem, id: `filler-${i}-${Math.random()}` });
            }
        }
        return items;
    };

    const resetSpinner = () => {
        if (spinnerRef.current) {
            spinnerRef.current.style.transition = 'none';
            spinnerRef.current.style.transform = 'translateX(0)';
        }
        setRollItems([]);
    };

    const getMotivationMessage = (rarity) => {
        switch (rarity) {
            case 'Common': return "Vận may sắp đến rồi!";
            case 'Uncommon': return "Khá hơn rồi! Thử lại đi!";
            case 'Rare': return "Tuyệt vời! Sắp trúng to!";
            case 'Epic': return "Quá đỉnh! Gần lắm rồi!";
            case 'Legendary': return "SIÊU PHẨM! CHÚC MỪNG!";
            case 'HyperChrome': return "HUYỀN THOẠI! SERVER GATO!";
            case 'Godly': return "BẠN LÀ NHẤT! ĐỈNH CAO!";
            case 'Secret': return "VÔ ĐỊCH THIÊN HẠ!";
            default: return "Chúc mừng bạn!";
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'Common': return 'text-gray-400';
            case 'Uncommon': return 'text-green-400';
            case 'Rare': return 'text-blue-400';
            case 'Epic': return 'text-purple-400';
            case 'Legendary': return 'text-orange-400';
            case 'HyperChrome': return 'text-pink-500 animate-pulse';
            case 'Godly': return 'text-red-600 animate-bounce';
            case 'Secret': return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]';
            default: return 'text-white';
        }
    };

    const getRarityBorderColor = (rarity) => {
        switch (rarity) {
            case 'Common': return 'border-gray-600';
            case 'Uncommon': return 'border-green-500 shadow-[0_0_5px_#22c55e]';
            case 'Rare': return 'border-blue-500 shadow-[0_0_5px_#3b82f6]';
            case 'Epic': return 'border-purple-500 shadow-[0_0_10px_#a855f7]';
            case 'Legendary': return 'border-orange-500 shadow-[0_0_15px_#f97316]';
            case 'HyperChrome': return 'border-pink-500 shadow-[0_0_15px_#ec4899]';
            case 'Godly': return 'border-red-600 shadow-[0_0_20px_#dc2626]';
            case 'Secret': return 'border-yellow-400 shadow-[0_0_25px_#facc15]';
            default: return 'border-gray-700';
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 md:px-8 bg-[url('/grid-bg.png')] bg-fixed bg-cover">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-white to-primary drop-shadow-[0_0_15px_rgba(0,234,255,0.5)] uppercase italic skew-x-[-10deg]">
                        Jailbreak Gacha
                    </h1>
                    <p className="text-xl text-blue-200 font-medium tracking-wide">
                        Thử vận may - Trúng xe sang - Rinh quà khủng
                    </p>
                </div>

                {/* Case List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cases.map((gachaCase) => (
                        <motion.div
                            key={gachaCase._id}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative bg-[#0f1923] border border-white/5 rounded-xl overflow-hidden shadow-xl"
                        >
                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-xl z-20 pointer-events-none box-shadow-[0_0_20px_rgba(0,234,255,0.2)]" />

                            <div className="relative h-48 bg-gradient-to-b from-[#1a2733] to-[#0f1923] flex items-center justify-center p-6 group-hover:bg-[#1f2e3d] transition-colors">
                                <Image
                                    src={gachaCase.image}
                                    alt={gachaCase.name}
                                    width={160}
                                    height={160}
                                    className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Rarity Badges floating */}
                                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                    {gachaCase.items.some(i => i.rarity === 'Godly') && (
                                        <span className="bg-red-600/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/50 shadow-neon-red">GODLY</span>
                                    )}
                                    {gachaCase.items.some(i => i.rarity === 'HyperChrome') && (
                                        <span className="bg-pink-600/20 text-pink-500 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-500/50 shadow-[0_0_5px_#ec4899]">HYPER</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 space-y-4 relative z-10 bg-[#0f1923] border-t border-white/5">
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wide group-hover:text-primary transition-colors">
                                        {gachaCase.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Cơ hội trúng <span className="text-secondary font-bold">Secret Item</span> hiếm nhất server!
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setSelectedCase(gachaCase)}
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-primary text-black font-black uppercase tracking-widest py-4 text-lg shadow-neon-blue skew-x-[-10deg]"
                                >
                                    Mở Ngay • {gachaCase.price.toLocaleString()} VNĐ
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* History Section - NEW */}
                <div className="bg-[#0f1923]/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setHistoryTab('global')}
                            className={`flex-1 py-4 text-center font-display font-bold uppercase tracking-wider transition-colors ${historyTab === 'global'
                                    ? 'bg-primary/10 text-primary border-b-2 border-primary shadow-[inset_0_-10px_20px_rgba(0,234,255,0.1)]'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Globe className="inline-block w-4 h-4 mr-2 mb-1" />
                            Live Drops (Toàn Server)
                        </button>
                        <button
                            onClick={() => setHistoryTab('personal')}
                            className={`flex-1 py-4 text-center font-display font-bold uppercase tracking-wider transition-colors ${historyTab === 'personal'
                                    ? 'bg-primary/10 text-primary border-b-2 border-primary shadow-[inset_0_-10px_20px_rgba(0,234,255,0.1)]'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <User className="inline-block w-4 h-4 mr-2 mb-1" />
                            Lịch Sử Của Tôi
                        </button>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1f2937] text-gray-400 text-xs uppercase sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="p-4 font-semibold">Vật Phẩm</th>
                                    <th className="p-4 font-semibold">Độ Hiếm</th>
                                    {historyTab === 'global' && <th className="p-4 font-semibold">Người Chơi</th>}
                                    <th className="p-4 font-semibold text-right">Thời Gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(historyTab === 'global' ? globalHistory : personalHistory).map((entry, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded bg-[#1a2733] border border-white/5 flex items-center justify-center ${getRarityBorderColor(entry.rarity)} p-1`}>
                                                <Image
                                                    src={entry.rarity === 'Secret' ? '/cs2_mystery_icon.png' : entry.itemImage}
                                                    alt={entry.itemName}
                                                    width={40}
                                                    height={40}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <span className={`font-bold font-display uppercase tracking-wide ${getRarityColor(entry.rarity)}`}>{entry.itemName}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest ${getRarityColor(entry.rarity)} bg-white/5 shadow-sm`}>
                                                {entry.rarity}
                                            </span>
                                        </td>
                                        {historyTab === 'global' && (
                                            <td className="p-4 text-gray-300 font-mono text-xs tracking-wider">
                                                {entry.winnerName}
                                            </td>
                                        )}
                                        <td className="p-4 text-right text-gray-500 text-xs">
                                            {new Date(entry.rolledAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                                {(historyTab === 'global' ? globalHistory : personalHistory).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-500 italic">
                                            Chưa có dữ liệu...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Spin Modal */}
                <AnimatePresence>
                    {selectedCase && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-4xl bg-[#0f1923] border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,234,255,0.1)] relative"
                            >
                                {/* Close Button */}
                                {!isSpinning && !showResult && (
                                    <button
                                        onClick={() => { setSelectedCase(null); resetSpinner(); }}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 transition-colors p-2 hover:bg-white/10 rounded-full"
                                    >
                                        <X size={24} />
                                    </button>
                                )}

                                {/* Header */}
                                <div className="p-6 text-center border-b border-white/10 bg-[#141e29]">
                                    <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white">
                                        <span className="text-primary mr-2">OPENING:</span>
                                        {selectedCase.name}
                                    </h2>
                                </div>

                                {/* Spinner Area */}
                                <div className="relative h-64 bg-black overflow-hidden flex items-center justify-center border-y border-white/10">
                                    {/* Center Line / Laser */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-yellow-400 z-30 shadow-[0_0_20px_#facc15] opacity-80" />
                                    <div className="absolute left-1/2 top-0 -translate-x-1/2 text-yellow-500 z-30 text-xl drop-shadow-md">▼</div>
                                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 text-yellow-500 z-30 text-xl drop-shadow-md">▲</div>

                                    {/* Vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-20 pointer-events-none opacity-80" />

                                    {/* Rolling Track */}
                                    <div className="flex items-center gap-2 px-[calc(50%-56px)] will-change-transform" ref={spinnerRef}>
                                        {rollItems.length > 0 ? rollItems.map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className={`w-28 h-36 flex-shrink-0 bg-[#1a2733] border-b-4 ${getRarityBorderColor(item.rarity)} flex flex-col items-center justify-center p-2 rounded relative group`}
                                            >
                                                {/* Card BG gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="relative w-20 h-20 mb-2 filter drop-shadow-lg">
                                                    <Image
                                                        src={item.rarity === 'Secret' ? '/cs2_mystery_icon.png' : item.image}
                                                        alt={item.name}
                                                        fill
                                                        className={`object-contain ${item.rarity === 'Secret' ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' : ''}`}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold truncate w-full text-center uppercase tracking-wider ${getRarityColor(item.rarity)}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        )) : (
                                            // Preview Items static
                                            selectedCase.items.slice(0, 10).map((item, idx) => (
                                                <div key={idx} className={`w-28 h-36 flex-shrink-0 bg-[#1a2733] border-b-4 opacity-40 border-gray-700 flex flex-col items-center justify-center p-2 rounded grayscale`}>
                                                    <div className="relative w-20 h-20 mb-1">
                                                        <Image
                                                            src={item.rarity === 'Secret' ? '/cs2_mystery_icon.png' : item.image}
                                                            alt={item.name}
                                                            fill
                                                            className={`object-contain`}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="p-8 flex justify-center bg-[#141e29] border-t border-white/10">
                                    {showResult ? (
                                        <div className="text-center animate-in fade-in zoom-in duration-300 w-full">
                                            <div className="mb-8">
                                                <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">You Unlocked</p>
                                                <h3 className={`text-5xl font-display font-black uppercase italic ${getRarityColor(wonItem.rarity)} drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]`}>
                                                    {wonItem.name}
                                                </h3>
                                                {wonItem.secretCode && (
                                                    <div className="mt-4 bg-black/60 px-6 py-3 rounded-lg border border-primary/30 inline-block shadow-lg">
                                                        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Secret Code</p>
                                                        <code className="text-primary font-mono tracking-[0.2em] text-xl select-all">{wonItem.secretCode}</code>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-4 justify-center">
                                                <Button
                                                    onClick={() => { setSelectedCase(null); resetSpinner(); }}
                                                    className="min-w-[150px] bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase tracking-wider"
                                                >
                                                    Đóng
                                                </Button>
                                                <Button
                                                    onClick={handleSpin}
                                                    className="min-w-[200px] bg-primary hover:bg-cyan-400 text-black font-black uppercase tracking-wider shadow-neon-blue"
                                                >
                                                    Quay Tiếp
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleSpin}
                                            disabled={isSpinning}
                                            className="w-full max-w-md py-6 text-2xl font-black uppercase tracking-[0.25em] bg-secondary hover:bg-pink-500 text-white shadow-neon-red disabled:opacity-50 disabled:cursor-not-allowed skew-x-[-10deg] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
                                        >
                                            {isSpinning ? (
                                                <>
                                                    <span className="animate-spin text-4xl">⚙</span>
                                                    ROLLING...
                                                </>
                                            ) : 'SPIN NOW'}
                                        </Button>
                                    )}
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
