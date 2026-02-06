"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, register: registerUser } = useAuth();
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
            await registerUser(username, email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-white/5 relative overflow-hidden">
                <h2 className="text-3xl font-display font-bold mb-2">Gia Nhập Giới Tinh Hoa</h2>
                <p className="text-gray-400 mb-8 text-sm">Tạo tài khoản VIP của bạn ngay hôm nay.</p>

                {error && <p className="mb-4 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Tên đăng nhập"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <button className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        Tạo Tài Khoản
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Đã là thành viên? <Link href="/login" className="text-primary hover:underline">Đăng Nhập</Link>
                </p>
            </div>
        </div>
    );
}
