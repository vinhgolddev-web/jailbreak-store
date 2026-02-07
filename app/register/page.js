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

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await registerUser(username, email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-white/5 relative overflow-hidden">
                <h2 className="text-3xl font-display font-bold mb-2">Đăng ký tài khoản</h2>
                <p className="text-gray-400 mb-8 text-sm">Tạo tài khoản của bạn ngay hôm nay.</p>

                {error && <p className="mb-4 text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            placeholder="Tên đăng nhập"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                            placeholder="Mật khẩu (Tối thiểu 8 ký tự)"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            minLength={8}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Đã là thành viên? <Link href="/login" className="text-primary hover:underline">Đăng Nhập</Link>
                </p>
            </div>
        </div>
    );
}
