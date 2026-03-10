'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { LayoutGrid, Search, Plus, Edit2, Trash2, Loader2, X, DollarSign, Tag, Briefcase } from 'lucide-react';
import adminApi from '@/api/adminAxios';
import { getCategories, getSubcategories } from '@/api/admin';
import { useTranslation } from 'react-i18next';

export default function ServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        detailedDescription: '',
        price: '',
        category: '',
        subcategory: '',
        commissionRate: '0'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servRes, catRes, subRes] = await Promise.all([
                adminApi.get('/admin/services'),
                getCategories(),
                getSubcategories()
            ]);

            if (servRes.data.success) setServices(servRes.data.data);
            setCategories(catRes.data || []);
            setSubcategories(subRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.deleteConfirm', { type: t('admin.service') }))) return;
        try {
            await adminApi.delete(`/admin/services/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting service:", error);
        }
    };

    const handleOpenModal = (service: any = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                title: service.title || '',
                detailedDescription: service.detailedDescription || '',
                price: service.price?.toString() || '',
                category: service.category?._id || '',
                subcategory: service.subcategory?._id || '',
                commissionRate: service.commissionRate?.toString() || '0'
            });
        } else {
            setEditingService(null);
            setFormData({
                title: '',
                detailedDescription: '',
                price: '',
                category: '',
                subcategory: '',
                commissionRate: '0'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                commissionRate: parseFloat(formData.commissionRate)
            };

            if (editingService) {
                await adminApi.put(`/admin/services/${editingService._id}`, payload);
            } else {
                await adminApi.post('/admin/services', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving service:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredServices = services.filter(service =>
        service.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.serviceManagement')}</h1>
                        <p className="text-gray-500 font-medium">{t('admin.serviceSubtitle')}</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-soft-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        {t('admin.addNewService')}
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/2 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-soft-black transition-colors" />
                            <input
                                type="text"
                                placeholder={t('admin.searchServices')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.service')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.category')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.price')}</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <Loader2 className="w-10 h-10 text-gray-200 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">{t('admin.loadingServices')}</p>
                                        </td>
                                    </tr>
                                ) : filteredServices.length > 0 ? (
                                    filteredServices.map((service) => (
                                        <tr key={service._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                        {service.imageUrl ? <img src={service.imageUrl} className="w-full h-full object-cover" /> : <Briefcase className="w-6 h-6 text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-soft-black">{service.title}</p>
                                                        <p className="text-xs text-gray-400 font-medium line-clamp-1 max-w-[200px]">{service.detailedDescription}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-soft-black">{service.category?.name || t('admin.unassigned')}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.subcategory?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-base font-black text-soft-black">₹{service.price}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => handleOpenModal(service)} className="p-2.5 text-gray-400 hover:text-soft-black hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                                        <Edit2 className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(service._id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium">{t('admin.noServicesFound')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-soft-black">{editingService ? t('admin.edit') : t('admin.add')} {t('admin.service')}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.serviceTitle')}</label>
                                    <input
                                        type="text" required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.category')}</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                        >
                                            <option value="">{t('admin.selectCategory', 'Select Category')}</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.subcategory', 'Subcategory')}</label>
                                        <select
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                        >
                                            <option value="">{t('admin.selectCategory', 'Select Category')}</option>
                                            {subcategories.filter(sub => sub.category?._id === formData.category).map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.price')} (₹)</label>
                                        <input
                                            type="number" required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.commissionRate')}</label>
                                        <input
                                            type="number"
                                            value={formData.commissionRate}
                                            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.description')}</label>
                                    <textarea
                                        rows={3}
                                        value={formData.detailedDescription}
                                        onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-2 px-4 py-4 bg-soft-black text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {editingService ? t('admin.saveService') : t('admin.add') + ' ' + t('admin.service')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
