"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Edit, Trash, Package } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Vehicle',
        rarity: 'Common',
        image: '',
        stock: ''
    });

    const fetchProducts = () => {
        api.get('/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', price: '', category: 'Vehicle', rarity: 'Common', image: '', stock: '' });
        setEditingProduct(null);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                rarity: product.rarity,
                image: product.image,
                stock: product.stock
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
                addToast('Product updated successfully', 'success');
            } else {
                await api.post('/products', formData);
                addToast('Product created successfully', 'success');
            }
            fetchProducts();
            setIsModalOpen(false);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to save product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            addToast('Product deleted successfully', 'success');
            fetchProducts();
        } catch (err) {
            addToast('Failed to delete product', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display">Products</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Add Product
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product._id} className="bg-surfaceHighlight border border-white/5 rounded-2xl p-4 flex gap-4 group">
                        <div className="w-24 h-24 bg-black/40 rounded-xl relative overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-white truncate">{product.name}</h3>
                                <p className="text-xs text-gray-500 mb-1">{product.category} • {product.rarity}</p>
                                <p className="font-mono text-primary">${product.price.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {product.stock} in stock
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'New Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Product Name</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Price</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Stock</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Category</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none appearance-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Vehicle</option>
                                <option>Skin</option>
                                <option>Weapon</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Rarity</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none appearance-none"
                                value={formData.rarity}
                                onChange={e => setFormData({ ...formData, rarity: e.target.value })}
                            >
                                <option>Common</option>
                                <option>Rare</option>
                                <option>Epic</option>
                                <option>Legendary</option>
                                <option>Godly</option>
                            </select>
                        </div>
                    </div>
                    <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
