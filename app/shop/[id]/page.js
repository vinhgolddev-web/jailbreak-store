"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Button from '@/components/ui/Button';
import { ShoppingCart, Shield, Truck, Zap, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Import useCart
import { useCart } from '@/context/CartContext';

export default function ProductDetail({ params }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { addToCart } = useCart(); // Hook
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // In a real app we'd need a specific endpoint like GET /products/:id
                const res = await api.get('/products');
                const found = res.data.find(p => p._id === id);
                setProduct(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        addToCart(product);
    };

    if (loading) return <div className="min-h-screen pt-32 text-center text-sm text-gray-400">Loading...</div>;
    if (!product) return <div className="min-h-screen pt-32 text-center text-sm text-gray-400">Product not found</div>;

    const isLegendary = product.rarity === 'Legendary';

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">

                {/* Image Side */}
                <div className="relative rounded-xl overflow-hidden bg-surface border border-white/10 aspect-[4/3] flex items-center justify-center p-8 bg-black/50">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={800}
                        height={600}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                    />
                </div>

                {/* Info Side */}
                <div className="space-y-8 pt-4">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400">
                                {product.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${isLegendary
                                ? 'border-yellow-400/20 text-yellow-400 bg-yellow-400/5'
                                : 'border-white/10 text-gray-400'
                                }`}>
                                {product.rarity}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{product.name}</h1>
                        <p className="text-2xl font-semibold text-white">{product.price.toLocaleString()} VNĐ</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 py-6 border-y border-white/5">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <Zap className="text-white" size={16} />
                            </div>
                            <div>
                                <p className="text-gray-200 font-medium">Instant Delivery</p>
                                <p className="text-gray-500 text-xs">Automated bot transfer</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <Shield className="text-white" size={16} />
                            </div>
                            <div>
                                <p className="text-gray-200 font-medium">Ban-Free Guarantee</p>
                                <p className="text-gray-500 text-xs">Safe trading method</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleAddToCart}
                            disabled={product.stock < 1}
                            className={`flex-1 h-12 text-sm font-medium rounded-lg transition-all ${product.stock < 1
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
