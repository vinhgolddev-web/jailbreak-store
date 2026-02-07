"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 lg:py-0">
        {/* Background Elements */}
        {/* User can replace 'banner.jpg' in public/images folder to update banner */}
        <div className="absolute inset-0 bg-[url('/images/banner.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay hover:opacity-40 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] h-[80vw] max-h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />

        <div className="container relative z-10 text-center space-y-6 sm:space-y-8 max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold tracking-widest mb-6 sm:mb-8 shadow-[0_0_15px_rgba(255,159,10,0.2)]">
              EST. 2026 • PREMIUM MARKETPLACE
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-display font-black tracking-tighter leading-none mb-6 text-white drop-shadow-2xl">
              THỐNG TRỊ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-gradient-x text-glow">
                JAILBREAK
              </span>
            </h1>
            <p className="text-lg sm:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              Sở hữu ngay các item hiếm nhất: <span className="text-primary font-bold">Torpedo</span>, <span className="text-primary font-bold">Beam Hybrid</span>, và <span className="text-primary font-bold">Hyperchrome</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
          >
            <Link href="/products" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-12 py-4 text-lg shadow-[0_0_20px_rgba(255,159,10,0.4)]">
                Khám Phá Store <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/gacha" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto px-12 py-4 text-lg">
                Thử Vận May
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-surface/50 border-y border-white/5 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <Feature
            icon={<Zap className="text-primary" size={32} />}
            title="Giao Hàng Tốc Độ"
            desc="Hệ thống tự động xử lý đơn hàng trong 30 giây."
          />
          <Feature
            icon={<ShieldCheck className="text-primary" size={32} />}
            title="Bảo Mật Tuyệt Đối"
            desc="Dữ liệu được mã hóa đầu cuối. An toàn 100%."
          />
          <Feature
            icon={<Star className="text-primary" size={32} />}
            title="Item Chính Hãng"
            desc="Cam kết không Duplicated. Bảo hành trọn đời."
          />
        </div>
      </section>
    </div>
  );
}

const Feature = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
    <div className="w-16 h-16 rounded-2xl bg-[#0F1115] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,159,10,0.1)] group-hover:shadow-[0_0_20px_rgba(255,159,10,0.3)]">
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-display mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
  </div>
);
