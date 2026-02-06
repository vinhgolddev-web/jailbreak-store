"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { User, Search } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-surfaceHighlight border border-white/10 focus:border-primary focus:outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-surfaceHighlight rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-sm">
                            <th className="py-4 pl-6">User</th>
                            <th className="py-4">Role</th>
                            <th className="py-4">Balance</th>
                            <th className="py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className={`px - 2 py - 1 rounded - full text - xs font - bold border ${user.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        } `}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 font-mono text-primary">{user.balance.toLocaleString()} VNĐ</td>
                                <td className="py-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                )}
            </div>
        </div>
    );
}
