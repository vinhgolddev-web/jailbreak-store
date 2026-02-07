import Button from './ui/Button';
import Image from 'next/image';
import { ShoppingBag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { memo } from 'react';

const ProductCard = memo(({ product, disabled }) => {
    const { addToCart } = useCart();
    const [imgSrc, setImgSrc] = useState(product.image);
    const rarityColors = {
        'Common': 'text-gray-400 border-gray-400/20 bg-gray-400/10',
        'Uncommon': 'text-green-400 border-green-400/20 bg-green-400/10',
        'Rare': 'text-blue-400 border-blue-400/20 bg-blue-400/10',
        'Epic': 'text-purple-400 border-purple-400/20 bg-purple-400/10',
        'Legendary': 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
        'HyperChrome': 'text-red-500 border-red-500/20 bg-red-500/10',
        'Godly': 'text-rose-500 border-rose-500/20 bg-rose-500/10',
        'Limited': 'text-orange-400 border-orange-400/20 bg-orange-400/10',
        'Secret': 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    };

    const colorClass = rarityColors[product.rarity] || 'text-gray-500 border-gray-500/20 bg-gray-500/5';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={`group relative flex flex-col rounded-lg bg-surface border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${['Legendary', 'Godly', 'Secret', 'HyperChrome'].includes(product.rarity) ? 'border-primary/40 shadow-[0_0_15px_rgba(255,159,10,0.15)]' : 'border-white/10 hover:border-white/30'}`}
        >
            {/* Image Container */}
            <div className="relative aspect-[16/10] bg-black/50 border-b border-white/5 flex items-center justify-center p-6 group-hover:bg-black/80 transition-colors">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    onError={() => setImgSrc('/images/placeholder.png')} // Better placeholder handling
                    className="object-contain grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Stock Tag */}
                <div className="absolute top-3 right-3 text-[10px] font-medium tracking-wide text-gray-400 bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 z-10">
                    {product.stock} CÒN LẠI
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1" title={product.name}>{product.name}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap ${colorClass}`}>
                        {product.rarity}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 capitalize">{product.category.toLowerCase()}</p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm font-semibold text-white">{(product.price || 0).toLocaleString()} VNĐ</span>
                    <Button
                        onClick={() => addToCart(product)}
                        disabled={disabled || product.stock < 1}
                        className={`min-h-[36px] px-3 text-xs font-medium rounded-md transition-all active:scale-95 ${product.stock < 1
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-gray-200 shadow-sm'
                            }`}
                    >
                        {product.stock > 0 ? 'Thêm' : 'Hết'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});

export default ProductCard;
