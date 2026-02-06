'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import axios from '../../lib/axios';

function DepositContent() {
    const { user, loading, refreshUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Tabs: 'qr' | 'card'
    const [activeTab, setActiveTab] = useState('qr');

    // PayOS States
    const [amount, setAmount] = useState(10000);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'cancelled' | null

    // Card States
    const [cardTelco, setCardTelco] = useState('VIETTEL');
    const [cardCode, setCardCode] = useState('');
    const [cardSerial, setCardSerial] = useState('');
    const [cardAmount, setCardAmount] = useState('10000');
    const [cardStatus, setCardStatus] = useState(null); // { type: 'success'|'error', message: '' }

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        const statusParam = searchParams.get('status');
        const codeParam = searchParams.get('code');
        const orderCodeParam = searchParams.get('orderCode');

        if ((statusParam === 'success' || statusParam === 'PAID' || codeParam === '00') && orderCodeParam) {
            verifyPayment(orderCodeParam);
        } else if (statusParam === 'cancelled' || statusParam === 'CANCELLED') {
            setStatus('cancelled');
        }
    }, [searchParams]);

    const verifyPayment = async (orderCode) => {
        try {
            const res = await axios.get(`/payment/verify/${orderCode}`);
            if (res.data.status === 'success') {
                setStatus('success');
                refreshUser();
                router.replace('/deposit');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('cancelled');
        }
    };

    const handleDeposit = async () => {
        if (amount < 2000) {
            alert('Số tiền nạp tối thiểu là 2,000 VNĐ');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axios.post('/payment/create-link', { amount });
            if (res.data.checkoutUrl) window.location.href = res.data.checkoutUrl;
        } catch (error) {
            console.error(error);
            alert('Tạo link thanh toán thất bại');
            setIsSubmitting(false);
        }
    };

    const handleCardSubmit = async (e) => {
        e.preventDefault();
        setCardStatus(null);
        setIsSubmitting(true);

        try {
            const res = await axios.post('/card/charging', {
                telco: cardTelco,
                code: cardCode,
                serial: cardSerial,
                amount: cardAmount
            });

            if (res.data.status === 'pending' || res.data.message) {
                setCardStatus({ type: 'success', message: 'Thẻ đã được gửi! Vui lòng chờ 1-2 phút để hệ thống xử lý.' });
                // Reset form
                setCardCode('');
                setCardSerial('');
            }
        } catch (error) {
            console.error(error);
            setCardStatus({
                type: 'error',
                message: error.response?.data?.message || 'Gửi thẻ thất bại. Vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Đang tải...</div>;

    return (
        <div className="container mx-auto px-4 pt-32 pb-20">
            <div className="max-w-md mx-auto bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6 text-center text-gradient-gold">NẠP TIỀN</h1>

                {/* Tabs */}
                {/* Tabs - Temporarily using only QR */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab('qr')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'qr' ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Chuyển Khoản / QR
                    </button>
                    <button
                        disabled
                        className="flex-1 py-2 rounded-lg text-sm font-bold text-gray-600 cursor-not-allowed border border-white/5 opacity-50"
                    >
                        Thẻ Cào (Bảo Trì)
                    </button>
                </div>

                {/* QR TAB */}
                {activeTab === 'qr' && (
                    <div className="animate-fade-in space-y-6">
                        {status === 'success' && (
                            <div className="p-4 bg-green-500/20 border border-green-500 rounded-xl text-center text-green-400 text-sm font-bold">
                                Nạp thành công!
                            </div>
                        )}
                        {status === 'cancelled' && (
                            <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-center text-red-400 text-sm font-bold">
                                Đã hủy giao dịch.
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Số tiền (VNĐ)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary focus:outline-none transition"
                                min="2000"
                            />
                            <p className="text-xs text-gray-500 mt-2">Tối thiểu: 2,000 VNĐ</p>
                        </div>
                        <button
                            onClick={handleDeposit}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-black text-lg text-black transition ${isSubmitting ? 'bg-gray-600' : 'bg-primary hover:bg-primaryGlow'} shadow-[0_0_20px_rgba(251,191,36,0.3)]`}
                        >
                            {isSubmitting ? 'ĐANG TẠO QR...' : 'TẠO QR CODE'}
                        </button>
                    </div>
                )}

                {/* CARD TAB */}
                {activeTab === 'card' && (
                    <form onSubmit={handleCardSubmit} className="animate-fade-in space-y-4">
                        {cardStatus && (
                            <div className={`p-4 border rounded-xl text-center text-sm font-bold ${cardStatus.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                                {cardStatus.message}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Loại thẻ</label>
                            <select
                                value={cardTelco}
                                onChange={(e) => setCardTelco(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="VIETTEL">Viettel</option>
                                <option value="VINAPHONE">Vinaphone</option>
                                <option value="MOBIFONE">Mobifone</option>
                                <option value="VIETNAMOBILE">Vietnamobile</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Mệnh giá</label>
                            <select
                                value={cardAmount}
                                onChange={(e) => setCardAmount(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                            >
                                {[10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000].map(val => (
                                    <option key={val} value={val}>{val.toLocaleString()} VNĐ</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Mã thẻ</label>
                            <input
                                required
                                value={cardCode}
                                onChange={(e) => setCardCode(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                placeholder="Nhập mã thẻ"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Số Serial</label>
                            <input
                                required
                                value={cardSerial}
                                onChange={(e) => setCardSerial(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                placeholder="Nhập số serial"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-black text-lg text-black transition ${isSubmitting ? 'bg-gray-600' : 'bg-primary hover:bg-primaryGlow'} shadow-[0_0_20px_rgba(251,191,36,0.3)]`}
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'NẠP THẺ NGAY'}
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            Lưu ý: Chọn sai mệnh giá có thể bị mất thẻ.
                        </p>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">Hệ thống nạp tự động 24/7</p>
                </div>
            </div>
        </div>
    );
}

export default function DepositPage() {
    return (
        <div className="min-h-screen bg-background text-white font-sans">
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment interface...</div>}>
                <DepositContent />
            </Suspense>
        </div>
    );
}
