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
    const [amount, setAmount] = useState(10000);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'cancelled' | null

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        const statusParam = searchParams.get('status');
        const codeParam = searchParams.get('code');
        const orderCodeParam = searchParams.get('orderCode');

        // PayOS returns status='PAID' or code='00' for success
        if ((statusParam === 'success' || statusParam === 'PAID' || codeParam === '00') && orderCodeParam) {
            // Verify payment and credit account
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
                // Refresh user balance without full reload
                refreshUser();
                // Clear URL params to prevent infinite verification loop
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
            if (res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            }
        } catch (error) {
            console.error(error);
            alert('Tạo link thanh toán thất bại');
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Đang tải...</div>;

    return (
        <div className="container mx-auto px-4 pt-32 pb-20">
            <div className="max-w-md mx-auto bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6 text-center text-gradient-gold">NẠP TIỀN</h1>

                {status === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-xl text-center text-green-400">
                        Thanh toán thành công! Số dư của bạn sẽ được cập nhật ngay lập tức.
                    </div>
                )}

                {status === 'cancelled' && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-center text-red-400">
                        Đã hủy thanh toán.
                    </div>
                )}

                <div className="space-y-6">
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
                        className={`w-full py-4 rounded-xl font-black text-lg text-black transition transform active:scale-95 ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primaryGlow shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                            }`}
                    >
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN QUA PAYOS'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">Cổng thanh toán an toàn qua PayOS</p>
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
