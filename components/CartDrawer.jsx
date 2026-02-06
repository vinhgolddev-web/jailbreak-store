"use client";

import { useState } from 'react';
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

    const [isConfirming, setIsConfirming] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(null); // stores order data including secretCode

    const handleCheckoutClick = () => {
        if (!user) {
            addToast("Vui lòng đăng nhập để thanh toán", "error");
            return;
        }
        if (cart.length === 0) return;
        setIsConfirming(true);
    };

    const processCheckout = async () => {
        try {
            // Bulk checkout API call
            const res = await api.post('/orders', {
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                }))
            });

            addToast("Mua hàng thành công!", "success");
            clearCart();
            refreshUser();
            setIsConfirming(false);
            setPurchaseSuccess(res.data.order);
        } catch (error) {
            addToast(error.response?.data?.message || "Thanh toán thất bại", "error");
            setIsConfirming(false);
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
                                <ShoppingBag size={20} /> Giỏ Hàng
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Success Screen */}
                        {purchaseSuccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                                    <ShoppingBag size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Mua Hàng Thành Công!</h3>
                                <p className="text-gray-400">Cảm ơn bạn đã mua sắm. Đây là mã nhận hàng số (Digital Code) của bạn:</p>

                                <div className="bg-white/10 p-6 rounded-xl border border-white/20 w-full">
                                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Mã bí mật</p>
                                    <div className="text-3xl font-mono font-black text-primary tracking-widest select-all cursor-pointer" onClick={() => {
                                        navigator.clipboard.writeText(purchaseSuccess.secretCode);
                                        addToast("Đã sao chép vào bộ nhớ đệm!", "success");
                                    }}>
                                        {purchaseSuccess.secretCode}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">(Bấm để sao chép)</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setPurchaseSuccess(null);
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : (
                            // Normal Cart Content
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {cart.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                            <ShoppingBag size={64} className="opacity-20" />
                                            <p>Giỏ hàng trống</p>
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

                                {cart.length > 0 && (
                                    <div className="p-6 border-t border-white/10 bg-surface/50 backdrop-blur-md">
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-gray-400 text-sm">Tổng cộng</span>
                                            <span className="text-2xl font-bold">${totalAmount.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckoutClick}
                                            className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition active:scale-95"
                                        >
                                            Thanh Toán Ngay
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Confirmation Modal Overlay */}
                        {isConfirming && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-[80] backdrop-blur-sm">
                                <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
                                    <h3 className="text-xl font-bold text-white mb-2">Xác Nhận Mua?</h3>
                                    <p className="text-gray-400 mb-6">
                                        Bạn sắp thanh toán <span className="text-white font-bold">${totalAmount.toLocaleString()}</span> cho {cart.length} món.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsConfirming(false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={processCheckout}
                                            className="flex-1 py-3 bg-primary hover:bg-primaryGlow text-black rounded-xl font-bold transition shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                        >
                                            Xác Nhận
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
