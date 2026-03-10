'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { CheckSquare, User, Mail, Shield, Check, X, Loader2, Info, MapPin, Briefcase } from 'lucide-react';
import adminApi from '@/api/adminAxios';
import { useTranslation } from 'react-i18next';

export default function VerificationPage() {
    const { t } = useTranslation();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/providers/pending');
            if (res.data.success) {
                setProviders(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching pending providers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async (id: string, action: 'approve' | 'reject') => {
        setProcessing(id);
        try {
            const res = await adminApi.post(`/admin/providers/${id}/verify`, { action });
            if (res.data.success) {
                fetchPending();
            }
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            alert(`Failed to ${action} provider.`);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-2xl font-black text-soft-black tracking-tight mb-1">{t('admin.providerVerification')}</h1>
                    <p className="text-gray-500 font-medium">{t('admin.verificationSubtitle')}</p>
                </div>

                {loading ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-gray-200 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold">{t('admin.fetchingPending')}</p>
                    </div>
                ) : providers.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {providers.map((provider) => (
                            <div key={provider._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-black/2 transition-all group">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-beige rounded-2xl flex items-center justify-center text-soft-black font-black text-xl">
                                            {provider.username?.[0].toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-soft-black mb-1">{provider.username}</h3>
                                            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                                                <Mail className="w-4 h-4" />
                                                {provider.email}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-orange-100">
                                        Pending Review
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p>
                                        <div className="flex items-center gap-2 text-soft-black font-bold">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            {provider.category || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                                        <p className="text-soft-black font-bold">{provider.experience ? `${provider.experience} Years` : 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                                        <div className="flex items-center gap-2 text-soft-black font-bold">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {provider.location || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                                        <p className="text-soft-black font-bold">{provider.contactNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleVerify(provider._id, 'approve')}
                                        disabled={!!processing}
                                        className="flex-1 bg-soft-black text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {processing === provider._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        {t('admin.approve')}
                                    </button>
                                    <button
                                        onClick={() => handleVerify(provider._id, 'reject')}
                                        disabled={!!processing}
                                        className="flex-1 border border-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <X className="w-5 h-5" />
                                        {t('admin.reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <CheckSquare className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-soft-black mb-2">{t('admin.allCaughtUp')}</h2>
                        <p className="text-gray-500 max-w-sm font-medium">{t('admin.noPendingApplications')}</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
