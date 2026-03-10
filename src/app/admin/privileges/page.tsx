'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Shield, Key, Plus, Lock, Unlock, Loader2, Check, X, AlertCircle } from 'lucide-react';
import adminApi from '@/api/adminAxios';
import { useTranslation } from 'react-i18next';

export default function PrivilegesPage() {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<any[]>([]);
    const [privileges, setPrivileges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'roles' | 'privileges'>('roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedPrivileges: [] as string[]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/roles');
            if (res.data.success) {
                setRoles(res.data.data.roles);
                setPrivileges(res.data.data.privileges);
            }
        } catch (error) {
            console.error("Error fetching roles/privileges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = activeTab === 'roles'
                ? { type: 'role', name: formData.name, privileges: formData.selectedPrivileges }
                : { type: 'privilege', name: formData.name, description: formData.description };

            await adminApi.post('/admin/roles', payload);
            setIsModalOpen(false);
            fetchData();
            setFormData({ name: '', description: '', selectedPrivileges: [] });
        } catch (error) {
            console.error("Error saving:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const togglePrivilege = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedPrivileges: prev.selectedPrivileges.includes(id)
                ? prev.selectedPrivileges.filter(p => p !== id)
                : [...prev.selectedPrivileges, id]
        }));
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.accessControl')}</h1>
                        <p className="text-gray-500 font-medium">{t('admin.accessSubtitle')}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-soft-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        {activeTab === 'roles' ? t('admin.addRole') : t('admin.addPrivilege')}
                    </button>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                    {(['roles', 'privileges'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white text-soft-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {t(`admin.${tab}`)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold">{t('admin.loadingAccessData')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'roles' ? (
                            roles.map((role) => (
                                <div key={role._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-black/2 transition-all group">
                                    <div className="w-12 h-12 bg-beige rounded-2xl flex items-center justify-center mb-6 text-soft-black">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-soft-black mb-2 uppercase tracking-tight">{role.name}</h3>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privileges ({role.privileges?.length || 0})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {role.privileges?.map((p: any) => (
                                                <span key={p._id} className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-100">
                                                    {p.name}
                                                </span>
                                            ))}
                                            {(!role.privileges || role.privileges.length === 0) && (
                                                <p className="text-sm font-medium text-gray-300 italic">No privileges assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            privileges.map((priv) => (
                                <div key={priv._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-black/2 transition-all group">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-black text-soft-black mb-1 italic">{priv.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{priv.description || t('admin.noDescription')}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-soft-black text-center w-full">Create {activeTab === 'roles' ? 'Role' : 'Privilege'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute right-6 top-6">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            {activeTab === 'roles' ? (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Assign Privileges</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2">
                                        {privileges.map(p => (
                                            <button
                                                key={p._id}
                                                type="button"
                                                onClick={() => togglePrivilege(p._id)}
                                                className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all text-center ${formData.selectedPrivileges.includes(p._id)
                                                    ? 'bg-soft-black text-white border-soft-black'
                                                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{t('admin.description')}</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-black/5 focus:bg-white transition-all font-medium resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-2 px-6 py-4 bg-soft-black text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {activeTab === 'roles' ? t('admin.createRole') : t('admin.createPrivilege')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
