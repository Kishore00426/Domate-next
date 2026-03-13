'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Search,
    Plus,
    Edit2,
    Trash2,
    MoreHorizontal,
    Folder,
    Layers,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
    getCategories,
    getSubcategories,
    deleteCategory,
    deleteSubcategory,
    createCategory,
    updateCategory,
    createSubcategory,
    updateSubcategory
} from '@/api/admin';
import { useTranslation } from 'react-i18next';

export default function CategoriesClient() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]); // For subcategory parent selection
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        icon: null as File | null,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'categories') {
                const res = await getCategories();
                setItems(res.data || []);
            } else {
                const res = await getSubcategories();
                setItems(res.data || []);
                // Also fetch categories for the parent selection dropdown
                const catRes = await getCategories();
                setCategories(catRes.data || []);
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.deleteConfirm', { type: activeTab === 'categories' ? t('admin.category') : t('admin.subcategory') }))) return;

        try {
            if (activeTab === 'categories') {
                await deleteCategory(id);
            } else {
                await deleteSubcategory(id);
            }
            fetchData();
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                description: item.description || '',
                categoryId: item.category?._id || '',
                icon: null,
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                icon: null,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);

            if (activeTab === 'subcategories' && formData.categoryId) {
                data.append('categoryId', formData.categoryId);
            }

            if (formData.icon) {
                data.append('image', formData.icon);
            }

            if (editingItem) {
                if (activeTab === 'categories') {
                    const payload = formData.icon ? data : {
                        name: formData.name,
                        description: formData.description
                    };
                    await updateCategory(editingItem._id, payload);
                } else {
                    const payload = formData.icon ? data : {
                        name: formData.name,
                        description: formData.description,
                        categoryId: formData.categoryId
                    };
                    await updateSubcategory(editingItem._id, payload);
                }
            } else {
                if (activeTab === 'categories') {
                    await createCategory(data);
                } else {
                    await createSubcategory(data);
                }
            }

            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving item:", error);
            alert(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500 text-black">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">
                            {t('admin.categoryManagement')}
                        </h1>
                        <p className="text-gray-500 font-medium">{t('admin.categorySubtitle')}</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-soft-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/5 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{activeTab === 'categories' ? t('admin.addNewCategory') : t('admin.addNewSubcategory')}</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-100 px-2">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'categories' ? 'text-soft-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            {t('admin.categories')}
                        </div>
                        {activeTab === 'categories' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-soft-black rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('subcategories')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'subcategories' ? 'text-soft-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            {t('admin.subcategories')}
                        </div>
                        {activeTab === 'subcategories' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-soft-black rounded-full" />}
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/2 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                            <input
                                type="text"
                                placeholder={t('admin.searchItems', { type: activeTab === 'categories' ? t('admin.categories') : t('admin.subcategories') })}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest w-16">{t('admin.icon')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.name')}</th>
                                    {activeTab === 'categories' ? (
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.description')}</th>
                                    ) : (
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.parentCategory')}</th>
                                    )}
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-gray-200 animate-spin" />
                                                <p className="text-gray-400 font-medium">{t('admin.fetchingItems')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {item.icon ? (
                                                        <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <LayoutGrid className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-soft-black">{item.name}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                {activeTab === 'categories' ? (
                                                    <p className="text-gray-500 text-sm line-clamp-1 font-medium max-w-md italic">{item.description || t('admin.noDescription', 'No description provided')}</p>
                                                ) : (
                                                    <span className="inline-flex items-center px-4 py-1.5 bg-gray-50 text-soft-black text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-100">
                                                        {item.category?.name || t('admin.unassigned')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-2.5 text-gray-400 hover:text-soft-black hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-medium">{t('admin.noItemsFound', { type: activeTab === 'categories' ? t('admin.categories') : t('admin.subcategories') })}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-soft-black">
                                {editingItem ? t('admin.edit') : t('admin.add')} {activeTab === 'categories' ? t('admin.category') : t('admin.subcategory')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium text-black"
                                    />
                                </div>

                                {activeTab === 'subcategories' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.parentCategory')}</label>
                                        <select
                                            required
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium text-black appearance-none"
                                        >
                                            <option value="">{t('admin.selectCategory', 'Select Category')}</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.description')}</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium text-black resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.icon')} / {t('admin.image', 'Image')}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                            {formData.icon ? (
                                                <img src={URL.createObjectURL(formData.icon)} className="w-full h-full object-cover" />
                                            ) : editingItem?.icon ? (
                                                <img src={editingItem.icon} className="w-full h-full object-cover" />
                                            ) : (
                                                <Plus className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                        <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-gray-100">
                                            {t('admin.chooseFile', 'Choose File')}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setFormData({ ...formData, icon: file });
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-2 px-4 py-4 bg-soft-black text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {editingItem ? t('admin.saveChanges') : t('admin.add') + ' ' + (activeTab === 'categories' ? t('admin.category') : t('admin.subcategory'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
