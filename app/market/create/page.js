"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { Plus, Image as ImageIcon, Tag, Hash } from 'lucide-react';

export default function CreateListingPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    if (user && user.role !== 'seller') {
        router.push('/market/register');
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/market/create', formData);
            addToast('Đăng bán thành công!', 'success');
            router.push('/market');
        } catch (error) {
            addToast(error.response?.data?.message || 'Đăng bán thất bại', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-8">
                <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Plus className="bg-primary text-black rounded-full p-1" size={28} />
                    Đăng Bán Vật Phẩm
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Tên Vật Phẩm</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Torpedo, Brulee..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Giá Bán (VNĐ)</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                name="price"
                                type="number"
                                required
                                min="2000"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="VD: 50000"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Tối thiểu 2,000 VNĐ. Phí sàn 5% ({formData.price ? (formData.price * 0.05).toLocaleString() : 0} VNĐ).</p>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Link Ảnh (URL)</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                name="image"
                                type="url"
                                required
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Mô Tả (Tùy chọn)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Thông tin thêm về vật phẩm..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white h-24 focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={submitting} className="w-full justify-center py-4 text-lg font-bold">
                            {submitting ? 'Đang Đăng...' : 'Đăng Bán Ngay'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
