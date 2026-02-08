"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { Facebook, Store } from 'lucide-react';

export default function RegisterSellerPage() {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [facebookLink, setFacebookLink] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user?.role === 'seller') {
        router.push('/market/create');
        return null; // Redirect if already seller
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/market/register', { facebookLink });
            addToast('Đăng ký thành công! Bạn giờ là Người bán.', 'success');
            await refreshUser();
            router.push('/market/create');
        } catch (error) {
            addToast(error.response?.data?.message || 'Đăng ký thất bại', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Store size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white">Đăng Ký Bán Hàng</h1>
                    <p className="text-gray-400 mt-2 text-sm">Liên kết Facebook để khách hàng liên hệ khi mua vật phẩm của bạn.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Link Facebook Cá Nhân</label>
                        <div className="relative">
                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="url"
                                required
                                value={facebookLink}
                                onChange={(e) => setFacebookLink(e.target.value)}
                                placeholder="https://www.facebook.com/your.profile"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-200">
                        <strong>Lưu ý:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Link Facebook phải chính xác để nhận thông báo.</li>
                            <li>Phí sàn cho mỗi giao dịch là <strong>5%</strong>.</li>
                            <li>Tiền bán sẽ được cộng trực tiếp vào ví hệ thống.</li>
                        </ul>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full justify-center py-3 text-lg">
                        {submitting ? 'Đang xử lý...' : 'Xác Nhận Đăng Ký'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
