"use client";
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
};

export default function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        layout
                        className="pointer-events-auto bg-[#141414] border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] backdrop-blur-md"
                    >
                        {icons[toast.type]}
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white capitalize">{toast.type}</h4>
                            <p className="text-xs text-gray-400">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition">
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
