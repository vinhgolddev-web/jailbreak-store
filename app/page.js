"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/hd/roblox-jailbreak-background-1920-x-1080-3szdq5q5q5q5q5q5.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow" />

        <div className="container relative z-10 text-center space-y-8 max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-bold tracking-widest mb-6">
              EST. 2026 • PREMIUM MARKETPLACE
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-tight mb-6">
              DOMINATE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primaryGlow to-accent animate-gradient-x">
                JAILBREAK
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Acquire the rarest <span className="text-white font-bold">Torpedoes</span>, <span className="text-white font-bold">Beam Hybrids</span>, and <span className="text-white font-bold">Hyperchromes</span> instantly. The #1 trusted source for high-tier Jailbreak assets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8"
          >
            <Link href="/shop">
              <Button className="md:px-12 md:text-lg">
                Browse Inventory <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="md:px-12 md:text-lg">
                Become VIP Member
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-surface/30 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            icon={<Zap className="text-primary" size={32} />}
            title="Instant Delivery"
            desc="Our automated bot network delivers your vehicle or item within 60 seconds of purchase."
          />
          <Feature
            icon={<ShieldCheck className="text-accent" size={32} />}
            title="Ban-Proof Safety"
            desc="Proprietary transfer methods ensure 100% account safety and zero detection risk."
          />
          <Feature
            icon={<Star className="text-purple-500" size={32} />}
            title="Verified Rarity"
            desc="Every item is verified authentic. We only stock the highest duplicate-free tiers."
          />
        </div>
      </section>
    </div>
  );
}

const Feature = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-surfaceHighlight/50 border border-white/5 hover:border-primary/20 transition-all group">
    <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-display mb-3 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);
