"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-display font-bold mb-2">Đăng Nhập Tài Khoản</h2>
                <p className="text-gray-400 mb-8 text-sm">Nhập thông tin đăng nhập.</p>

                {error && <p className="mb-4 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Mật khẩu"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform active:scale-95">
                        Đăng Nhập
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Chưa có tài khoản? <Link href="/register" className="text-primary hover:underline">Đăng ký thành viên</Link>
                </p>
            </div>
        </div>
    );
}
