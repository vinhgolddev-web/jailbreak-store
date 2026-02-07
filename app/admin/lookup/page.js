"use client";

import { useState } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { Search, Gift, ShieldCheck, User, Calendar, Box } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminLookup() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await api.get(`/lookup/search?code=${code}`);
            if (res.data.found) {
                setResult(res.data);
                addToast('Found successfully', 'success');
            } else {
                addToast('Code not found in system', 'error');
            }
        } catch (err) {
            addToast('Error searching code', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-8">Code Lookup Tool</h1>

            {/* Search Input */}
            <div className="bg-surface border border-white/10 rounded-2xl p-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Enter Secret Code, Gift Code, or Order ID..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:outline-none placeholder:text-gray-600 font-mono text-lg"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <Button type="search" disabled={loading} className="px-8 text-lg">
                        {loading ? 'Searching...' : 'Lookup'}
                    </Button>
                </form>
                <p className="text-gray-500 text-sm mt-4 ml-2">
                    * Supports Gacha Secret Codes (`SECRET-XXXX`), Gift Codes (`GIFT-XXXX`), and Order IDs.
                </p>
            </div>

            {/* Results Display */}
            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`border-l-4 ${result.type === 'GACHA' ? 'border-purple-500' : 'border-blue-500'} bg-surfaceHighlight border border-white/5 rounded-r-2xl overflow-hidden`}>

                        {/* Header */}
                        <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${result.type === 'GACHA' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {result.type === 'GACHA' ? <Gift size={24} /> : <Box size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {result.type === 'GACHA' ? 'Gacha Reward' : 'Store Order'}
                                    </h2>
                                    <p className="text-sm text-gray-400 font-mono">{result.data._id}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.type === 'GACHA'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                {result.type === 'GACHA' ? 'GACHA SYSTEM' : 'SHOP SYSTEM'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* User Info */}
                            <div className="space-y-4">
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <User size={16} /> Owner Information
                                </h3>
                                <div className="bg-black/30 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Username:</span>
                                        <span className="text-white font-medium">{result.data.userId?.username || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="text-white font-medium">{result.data.userId?.email || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">User ID:</span>
                                        <span className="text-gray-600 font-mono text-xs">{result.data.userId?._id || result.data.userId}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Item Info */}
                            <div className="space-y-4">
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={16} /> Asset Details
                                </h3>

                                {result.type === 'GACHA' ? (
                                    <div className="bg-black/30 rounded-xl p-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-lg p-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={result.data.itemImage} alt={result.data.itemName} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-white">{result.data.itemName}</p>
                                            <p className={`text-sm ${result.data.isSecret ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                {result.data.rarity} {result.data.isSecret && '(SECRET ITEM)'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">From Case: {result.data.caseName}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black/30 rounded-xl p-4 space-y-2">
                                        {result.data.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                                <div className="w-10 h-10 bg-white/5 rounded-lg p-1">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.productId?.image} alt={item.productId?.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{item.productId?.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <span className="block text-gray-500 text-xs mb-1">Status</span>
                                    <span className={`font-bold ${result.type === 'GACHA' ? 'text-green-500' :
                                            result.data.status === 'completed' ? 'text-green-500' :
                                                'text-yellow-500'
                                        }`}>
                                        {result.type === 'GACHA' ? 'CLAIMED' : result.data.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl text-center">
                                    <span className="block text-gray-500 text-xs mb-1">Date</span>
                                    <span className="font-mono text-white text-sm">
                                        {new Date(result.data.createdAt || result.data.rolledAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl text-center md:col-span-2">
                                    <span className="block text-gray-500 text-xs mb-1">Validation Code</span>
                                    <span className="font-mono text-yellow-500 font-bold select-all">
                                        {result.data.secretCode || 'N/A'}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
