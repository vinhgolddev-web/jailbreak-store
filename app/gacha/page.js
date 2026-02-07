"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Sparkles, X, Gift, History, Globe, User } from 'lucide-react';

export default function GachaPage() {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollItems, setRollItems] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [wonItem, setWonItem] = useState(null);

    // History State
    const [historyTab, setHistoryTab] = useState('global'); // 'global' or 'me'
    const [globalHistory, setGlobalHistory] = useState([]);
    const [myHistory, setMyHistory] = useState([]);

    const spinnerRef = useRef(null);

    useEffect(() => {
        fetchCases();
        fetchGlobalHistory();
    }, []);

    useEffect(() => {
        if (user) fetchMyHistory();
    }, [user]);

    const fetchCases = async () => {
        try {
            const res = await api.get('/gacha');
            setCases(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchGlobalHistory = async () => {
        // Placeholder for now as backend is not ready
        // In real imp, fetch from /api/gacha/recent
        setGlobalHistory([
            { itemName: 'Torpedo', rarity: 'Secret', username: 'Vin***', rolledAt: new Date().toISOString() },
            { itemName: 'Beignet', rarity: 'Godly', username: 'Gam***', rolledAt: new Date().toISOString() },
        ]);
    };

    const fetchMyHistory = async () => {
        try {
            const res = await api.get('/gacha/history');
            setMyHistory(res.data);
        } catch (error) {
            console.error(error);
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
            case 'Godly': return 'text-red-500 animate-pulse font-bold';
            case 'Secret': return 'text-yellow-400 animate-pulse font-black'; // Gold
            default: return 'text-gray-400';
        }
    };


    const generateRollItems = (currCase, winner) => {
        const items = [];
        const totalItems = 60; // Increased filler
        const winnerIndex = 45; // Winner position

        const baitItems = currCase.items.filter(i => ['Godly', 'Secret', 'HyperChrome'].includes(i.rarity));
        const baitItem = baitItems.length > 0 ? baitItems[Math.floor(Math.random() * baitItems.length)] : null;
        const triggerNearMiss = Math.random() < 0.001; // 0.1% chance

        for (let i = 0; i < totalItems; i++) {
            if (i === winnerIndex) {
                items.push({ ...winner, id: `winner-${i}` });
            } else if (i === winnerIndex + 1 && baitItem && triggerNearMiss && ['Common', 'Uncommon'].includes(winner.rarity)) {
                items.push({ ...baitItem, id: `bait-${i}-${Math.random()}` });
            } else {
                items.push({ ...currCase.items[Math.floor(Math.random() * currCase.items.length)], id: `filler-${i}` });
            }
        }
        return items;
    };

    const handleSpin = async () => {
        if (!user) return addToast('Vui lòng đăng nhập để quay!', 'error');
        if (user.balance < selectedCase.price) return addToast('Số dư không đủ!', 'error');

        setIsRolling(true);
        setShowResult(false);
        setWonItem(null);

        try {
            const res = await api.post('/gacha/roll', { caseId: selectedCase._id });
            const { wonItem: realItem, visualItem, newBalance } = res.data;

            // Use visualItem for spinner (shows Mystery Icon if Secret)
            const rollSequence = generateRollItems(selectedCase, visualItem);
            setRollItems(rollSequence);
            refreshUser(); // Update balance immediately in UI

            // Spin Animation (Handled by GachaSpinner useEffect listening to rollItems)

            // Show Result after spin
            setTimeout(() => {
                setWonItem(realItem); // Show actual item (revealed)
                setShowResult(true);
                setIsRolling(false);
                fetchGlobalHistory();
                fetchMyHistory();

                // Motivation Message
                const msgs = {
                    'Common': "Suýt nữa thì trúng Godly! Thử lại ngay!",
                    'Godly': "ĐỈNH CỦA CHÓP! BẠN LÀ NHẤT!",
                    'Secret': "KHÔNG THỂ TIN NỔI! JACKPOT!",
                };
                addToast(msgs[realItem.rarity] || "Chúc mừng bạn!", 'success');

            }, 6500); // 6s spin + 0.5s buffer

        } catch (error) {
            setIsRolling(false);
            addToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4">

                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-2xl">
                        VÒNG QUAY <span className="text-primary text-glow">MAY MẮN</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Săn vật phẩm giới hạn với giá cực rẻ!</p>
                </div>

                import GachaSpinner from '@/components/GachaSpinner';
                import GachaCaseList from '@/components/GachaCaseList';

                // ... (inside GachaPage)

                {/* Case Selection using Memoized Component */}
                {!selectedCase && (
                    <GachaCaseList cases={cases} onSelect={setSelectedCase} />
                )}

                {/* Active Case (Spinner) using Memoized Component */}
                {selectedCase && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Button variant="outline" onClick={() => !isRolling && setSelectedCase(null)} disabled={isRolling}>
                                <X size={20} className="mr-2" /> Quay lại
                            </Button>
                            <div className="text-2xl font-bold text-primary">{selectedCase.name}</div>
                        </div>

                        <GachaSpinner rollItems={rollItems} activeCase={selectedCase} />

                        {/* Spin Button */}
                        <div className="flex justify-center">
                            <Button
                                onClick={handleSpin}
                                disabled={isRolling}
                                className="px-12 py-4 text-xl shadow-[0_0_30px_rgba(255,159,10,0.4)] animate-pulse-slow"
                            >
                                {isRolling ? 'Đang quay...' : `QUAY NGAY (${(selectedCase.price || 0).toLocaleString()} VNĐ)`}
                            </Button>
                        </div>
                    </div>
                )}

                {/* History Section */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <div className="flex items-center gap-6 border-b border-white/10 mb-6">
                        <button
                            onClick={() => setHistoryTab('global')}
                            className={`pb-4 text-lg font-bold flex items-center gap-2 transition-colors ${historyTab === 'global' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Globe size={20} /> Trúng Thưởng Gần Đây
                        </button>
                        <button
                            onClick={() => setHistoryTab('me')}
                            className={`pb-4 text-lg font-bold flex items-center gap-2 transition-colors ${historyTab === 'me' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                        >
                            <User size={20} /> Lịch Sử Của Tôi
                        </button>
                    </div>

                    <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="p-4 font-medium">Vật Phẩm</th>
                                    <th className="p-4 font-medium">Độ Hiếm</th>
                                    {historyTab === 'global' && <th className="p-4 font-medium">Người Chơi</th>}
                                    <th className="p-4 font-medium text-right">Thời Gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {(historyTab === 'global' ? globalHistory : myHistory).map((h, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{h.itemName}</td>
                                        <td className={`p-4 font-bold ${getRarityColor(h.rarity)}`}>{h.rarity}</td>
                                        {historyTab === 'global' && <td className="p-4 text-gray-400">{h.username}</td>}
                                        <td className="p-4 text-gray-500 text-right">{new Date(h.rolledAt).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                                {(historyTab === 'global' ? globalHistory : myHistory).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {showResult && wonItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-surface border border-primary/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent animate-pulse-slow" />

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white mb-2">CHÚC MỪNG!</h2>
                                <p className="text-gray-400 mb-8">Bạn đã nhận được</p>

                                <div className="relative w-48 h-48 mx-auto mb-6">
                                    <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse ${wonItem.rarity === 'Godly' ? 'bg-red-500/30' : ''}`} />
                                    <Image src={wonItem.image} alt={wonItem.name} fill className="object-contain relative z-10 drop-shadow-2xl" />
                                </div>

                                <div className={`text-2xl font-bold mb-8 ${getRarityColor(wonItem.rarity)}`}>
                                    {wonItem.name}
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={() => setShowResult(false)} className="flex-1">
                                        Nhận Quà
                                    </Button>
                                    <Button variant="secondary" onClick={() => { setShowResult(false); handleSpin(); }}>
                                        Quay Tiếp
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
