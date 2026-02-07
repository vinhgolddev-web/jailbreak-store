"use client";

import { motion } from 'framer-motion';
import { Facebook, DollarSign, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SellCarsPage() {
    return (
        <div className="container mx-auto px-4 py-20 min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center max-w-2xl w-full">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                        <DollarSign size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Thu Mua Xe <span className="text-primary">Giá Cực Tốt</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto">
                        Bạn có xe hiếm hoặc dư dùng? Chúng tôi thu mua với giá tốt nhất thị trường.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
                    <FeatureCard
                        icon={<DollarSign className="text-green-400" />}
                        title="Giá Cao Hơn"
                        desc="Thu mua cao hơn giá trị thường 10-20%."
                    />
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" />}
                        title="Nhanh Gọn"
                        desc="Giao dịch tức thì, nhận tiền trong 5 phút."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="text-blue-400" />}
                        title="Uy Tín"
                        desc="Admin trực tiếp giao dịch, đảm bảo an toàn."
                    />
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full bg-gradient-to-b from-surfaceHighlight to-surface border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Liên Hệ Ngay</h2>
                    <p className="text-gray-400 mb-8 relative z-10">
                        Nhắn tin trực tiếp qua Facebook để được định giá và giao dịch.
                    </p>

                    <Link
                        href="https://www.facebook.com/vinh.gold.185743" // TODO: Update this link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg active:scale-95 relative z-10"
                    >
                        <Facebook size={24} />
                        Chat Facebook Admin
                    </Link>

                    <p className="text-xs text-gray-500 mt-6 relative z-10">
                        *Vui lòng chuẩn bị tên xe và hình ảnh để được hỗ trợ nhanh nhất.
                    </p>
                </motion.div>

            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-xl bg-surface/50 border border-white/5 text-center hover:bg-surfaceHighlight/50 transition-colors"
        >
            <div className="mb-3 inline-flex p-3 rounded-lg bg-black/30 border border-white/5">
                {icon}
            </div>
            <h3 className="text-white font-semibold mb-1">{title}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </motion.div>
    );
}
