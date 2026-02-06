"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import api from "@/lib/axios";

export default function CartDrawer() {
    const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();

    const handleCheckout = async () => {
        if (!user) {
            addToast("Please login to checkout", "error");
            return;
        }

        if (cart.length === 0) return;

        try {
            // Bulk checkout API call
            await api.post('/orders', {
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                }))
            });

            addToast("Purchase Successful!", "success");
            clearCart();
            refreshUser();
            setIsOpen(false);
        } catch (error) {
            addToast(error.response?.data?.message || "Checkout Failed", "error");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag size={20} /> Your Cart
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                    <ShoppingBag size={64} className="opacity-20" />
                                    <p>Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="relative w-20 h-20 bg-surface rounded-lg border border-white/5 overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                                                <p className="text-xs text-gray-400">{item.category}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center rounded-md border border-white/10 bg-white/5">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        className="px-2 py-1 hover:bg-white/10 text-xs transition disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 text-xs font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        className="px-2 py-1 hover:bg-white/10 text-xs transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-gray-500 hover:text-red-500 transition self-start"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-surface/50 backdrop-blur-md">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-gray-400 text-sm">Total</span>
                                    <span className="text-2xl font-bold">${totalAmount.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition active:scale-95"
                                >
                                    Checkout Now
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
