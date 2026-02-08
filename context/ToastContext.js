"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ui/Toast';
import { useSoundSystem } from './SoundContext';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const { playSuccess, playError } = useSoundSystem();

    const addToast = useCallback((message, type = 'info') => {
        // Play sound based on type
        if (type === 'success') {
            playSuccess();
        } else if (type === 'error') {
            playError();
        }

        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, [playSuccess, playError]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
