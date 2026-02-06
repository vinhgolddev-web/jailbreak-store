import Button from './ui/Button';
import { ShoppingBag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
// Import useCart
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, disabled }) {
    const isLegendary = product.rarity === 'Legendary';
    const { addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const handleBuyNow = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        addToCart(product);
        // We could also redirect to checkout immediately if desired, 
        // but for "Buy Now" in a cart system, usually it just adds and opens cart.
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex flex-col rounded-lg bg-surface border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/30 hover:-translate-y-1"
        >
            {/* Image Container */}
            <div className="relative aspect-[16/10] bg-black/50 border-b border-white/5 flex items-center justify-center p-6 group-hover:bg-black/80 transition-colors">
                <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={250}
                    className="w-full h-full object-contain grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />

                {/* Stock Tag */}
                <div className="absolute top-3 right-3 text-[10px] font-medium tracking-wide text-gray-400 bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10">
                    {product.stock} CÒN LẠI
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight">{product.name}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${isLegendary ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' : 'text-gray-500 border-gray-500/20'}`}>
                        {product.rarity}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 capitalize">{product.category.toLowerCase()}</p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm font-semibold text-white">{product.price.toLocaleString()} VNĐ</span>
                    <Button
                        onClick={() => addToCart(product)}
                        disabled={disabled || product.stock < 1}
                        className={`min-h-[44px] sm:min-h-[36px] px-4 text-sm sm:text-xs font-semibold sm:font-medium rounded-lg sm:rounded-md transition-all active:scale-95 ${product.stock < 1
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-gray-200 shadow-sm'
                            }`}
                    >
                        {product.stock > 0 ? 'Thêm vào Giỏ' : 'Hết Hàng'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
